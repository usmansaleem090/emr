import { Router } from 'express';
import { ClinicStaffDAL } from '../../dal/clinic-management/clinicDAL';
import { insertClinicStaffSchema, updateClinicStaffSchema } from '../../models/clinicSchema';
import { createResponse } from '../../utils/helpers';
import { authMiddleware } from '../../middleware/authMiddleware';
import { UserDAL } from '../../dal/securityDAL';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = Router();

// Schema for creating clinic staff with user
const createStaffWithUserSchema = z.object({
  user: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6)
  }),
  staff: insertClinicStaffSchema.omit({ userId: true }).extend({
    employeeId: z.string().optional()
  })
});

// Get all clinic staff with optional filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { clinic_id, location_id } = req.query;
    
    const filters = {
      clinicId: clinic_id ? parseInt(clinic_id as string) : undefined,
      locationId: location_id ? parseInt(location_id as string) : undefined,
    };

    const staff = await ClinicStaffDAL.getAllStaffWithUsers(
      filters.clinicId,
      filters.locationId
    );

    // Transform data to match frontend expectations
    const transformedStaff = staff.map((item: any) => ({
      id: item.staff.id,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      email: item.user.email,
      phone: item.user.phone,
      employeeId: item.staff.employeeId,
      position: item.staff.position,
      department: item.staff.department,
      employmentStatus: item.staff.employmentStatus,
      startDate: item.staff.startDate,
      endDate: item.staff.endDate,
      salary: item.staff.salary,
      hourlyRate: item.staff.hourlyRate,
      emergencyContactName: item.staff.emergencyContactName,
      emergencyContactPhone: item.staff.emergencyContactPhone,
      emergencyContactRelation: item.staff.emergencyContactRelation,
      address: item.staff.address,
      dateOfBirth: item.staff.dateOfBirth,
      gender: item.staff.gender,
      notes: item.staff.notes,
      status: item.staff.status,
      userId: item.staff.userId,
      clinicId: item.staff.clinicId,
      supervisorId: item.staff.supervisorId,
      createdAt: item.staff.createdAt,
      updatedAt: item.staff.updatedAt,
      clinicName: item.clinic?.name
    }));

    res.json(createResponse(
      true,
      'Staff retrieved successfully',
      transformedStaff
    ));
  } catch (error: any) {
    console.error('Error fetching staff:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch staff',
      null,
      { error: error.message }
    ));
  }
});

// Get clinic staff by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await ClinicStaffDAL.getStaffByIdWithUser(parseInt(id));

    if (!staff) {
      return res.status(404).json(createResponse(
        false,
        'Staff member not found'
      ));
    }

    res.json(createResponse(
      true,
      'Staff member retrieved successfully',
      staff
    ));
  } catch (error: any) {
    console.error('Error fetching staff member:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch staff member',
      null,
      { error: error.message }
    ));
  }
});

// Create new staff member with user account
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;
    const validatedData = createStaffWithUserSchema.parse(req.body);

    // Create user account first
    const hashedPassword = await bcrypt.hash(validatedData.user.password, 12);
    const userData = {
      ...validatedData.user,
      passwordHash: hashedPassword,
      username: validatedData.user.email, // Use email as username
      userType: 'Staff' as const,
      clinicId: user.clinicId || validatedData.staff.clinicId
    };

    const newUser = await UserDAL.create(userData);

    // Create staff profile
    const staffData = {
      ...validatedData.staff,
      userId: newUser.id,
      clinicId: user.clinicId || validatedData.staff.clinicId
    };

    const newStaff = await ClinicStaffDAL.createStaff(staffData);

    // Get the complete staff data with user info
    const completeStaff = await ClinicStaffDAL.getStaffByIdWithUser(newStaff.id);

    res.status(201).json(createResponse(
      true,
      'Staff member created successfully',
      completeStaff
    ));
  } catch (error: any) {
    console.error('Error creating staff member:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to create staff member',
      null,
      { error: error.message }
    ));
  }
});

// Update staff member
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { user: userData, staff: staffData } = req.body;

    // Update user information if provided
    if (userData) {
      const existingStaff = await ClinicStaffDAL.getStaffByIdWithUser(parseInt(id));
      if (existingStaff?.user?.id) {
        await UserDAL.update(existingStaff.user.id, userData);
      }
    }

    // Update staff information
    if (staffData) {
      const validatedStaffData = updateClinicStaffSchema.parse(staffData);
      await ClinicStaffDAL.updateStaff(parseInt(id), validatedStaffData);
    }

    // Get updated staff data
    const updatedStaff = await ClinicStaffDAL.getStaffByIdWithUser(parseInt(id));

    res.json(createResponse(
      true,
      'Staff member updated successfully',
      updatedStaff
    ));
  } catch (error: any) {
    console.error('Error updating staff member:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to update staff member',
      null,
      { error: error.message }
    ));
  }
});

// Delete staff member
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get staff info before deletion
    const staff = await ClinicStaffDAL.getStaffByIdWithUser(parseInt(id));
    if (!staff) {
      return res.status(404).json(createResponse(
        false,
        'Staff member not found'
      ));
    }

    // Delete staff profile (this will cascade to user account)
    await ClinicStaffDAL.deleteStaff(parseInt(id));

    // Also delete the associated user account
    if (staff.user?.id) {
      await UserDAL.deleteUser(staff.user.id);
    }

    res.json(createResponse(
      true,
      'Staff member deleted successfully'
    ));
  } catch (error: any) {
    console.error('Error deleting staff member:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to delete staff member',
      null,
      { error: error.message }
    ));
  }
});

// Get staff statistics
router.get('/stats/:clinicId', authMiddleware, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const stats = await ClinicStaffDAL.getStaffStats(parseInt(clinicId));

    res.json(createResponse(
      true,
      'Staff statistics retrieved successfully',
      stats
    ));
  } catch (error: any) {
    console.error('Error fetching staff statistics:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch staff statistics',
      null,
      { error: error.message }
    ));
  }
});

// Get potential supervisors
router.get('/supervisors/:clinicId', authMiddleware, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { exclude } = req.query;
    const excludeId = exclude ? parseInt(exclude as string) : undefined;

    const supervisors = await ClinicStaffDAL.getPotentialSupervisors(parseInt(clinicId), excludeId);

    res.json(createResponse(
      true,
      'Potential supervisors retrieved successfully',
      supervisors
    ));
  } catch (error: any) {
    console.error('Error fetching potential supervisors:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch potential supervisors',
      null,
      { error: error.message }
    ));
  }
});

// Get clinic staff by clinic and location
router.get('/clinic/:clinicId/location/:locationId', authMiddleware, async (req, res) => {
  try {
    const { clinicId, locationId } = req.params;
    const staff = await ClinicStaffDAL.getStaffByClinicAndLocation(
      parseInt(clinicId),
      parseInt(locationId)
    );

    res.json(createResponse(
      true,
      'Clinic staff retrieved successfully',
      staff
    ));
  } catch (error: any) {
    console.error('Error getting clinic staff:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to retrieve clinic staff',
      null,
      { error: error.message }
    ));
  }
});

export default router; 