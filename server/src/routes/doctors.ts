import { Router } from 'express';
import { DoctorDAL } from '../dal/clinic-management/doctorDAL';
import { UserDAL } from '../dal/securityDAL';
import { insertDoctorSchema, type InsertDoctor } from '../models/Doctor/doctorSchema';
import { z } from 'zod';
import { db } from '../../db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const router = Router();

// Create doctor form schema (includes user data)
const createDoctorSchema = z.object({
  user: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  doctor: z.object({
    specialty: z.string().min(1, "Specialty is required"),
    licenseNumber: z.string().min(1, "License number is required"),
    status: z.enum(["active", "inactive", "suspended"]).default("active"),
    clinicId: z.number(),
    locationId: z.number().optional(),
  })
});

// Update doctor schema
const updateDoctorSchema = createDoctorSchema.partial().extend({
  id: z.number()
});

// Get all doctors for a clinic and location
router.get('/', async (req, res) => {
  try {
    const { clinicId, locationId } = req.query;
    
    let doctors;
    if (clinicId && locationId) {
      doctors = await DoctorDAL.getDoctorsByClinicAndLocation(Number(clinicId), Number(locationId));
    } else if (clinicId) {
      doctors = await DoctorDAL.getAllDoctorsWithUsers(Number(clinicId));
    } else {
      doctors = await DoctorDAL.getAllDoctorsWithUsers();
    }

    return res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    
    const doctor = await DoctorDAL.getDoctorByIdWithUser(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    return res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor'
    });
  }
});

// Create new doctor
router.post('/', async (req, res) => {
  try {
    const validatedData = createDoctorSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await UserDAL.findByEmail(validatedData.user.email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if license number already exists
    const existingDoctor = await DoctorDAL.getDoctorByUserId(validatedData.doctor.licenseNumber);
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }

    // Create user first (UserDAL.create will handle password hashing)
    const userData = {
      username: validatedData.user.email, // Use email as username
      email: validatedData.user.email,
      passwordHash: validatedData.user.password, // Pass raw password, UserDAL.create will hash it
      userType: "Doctor" as const,
      clinicId: validatedData.doctor.clinicId,
      roleId: null,
      firstName: validatedData.user.firstName,
      lastName: validatedData.user.lastName,
      phone: validatedData.user.phone || null,
      status: "active"
    };

    const newUser = await UserDAL.create(userData);

    // Create doctor record
    const doctorData: InsertDoctor = {
      userId: newUser.id,
      clinicId: validatedData.doctor.clinicId,
      locationId: validatedData.doctor.locationId || null,
      specialty: validatedData.doctor.specialty,
      licenseNumber: validatedData.doctor.licenseNumber,
      status: validatedData.doctor.status
    };

    const newDoctor = await DoctorDAL.createDoctor(doctorData);

    // Return complete doctor data
    const result = await DoctorDAL.getDoctorByIdWithUser(newDoctor.id);

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Doctor created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Error creating doctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create doctor'
    });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    const validatedData = updateDoctorSchema.parse({ ...req.body, id: doctorId });
    
    // Check if doctor exists
    const existingDoctor = await DoctorDAL.getDoctorByIdWithUser(doctorId);
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check email uniqueness if email is being updated
    if (validatedData.user?.email) {
      const existingUser = await UserDAL.findByEmail(validatedData.user.email);
      if (existingUser && existingUser.id !== existingDoctor.doctor.userId) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check license number uniqueness if license number is being updated
    if (validatedData.doctor?.licenseNumber) {
      const existingLicense = await DoctorDAL.getDoctorByUserId(validatedData.doctor.licenseNumber);
      if (existingLicense && existingLicense.id !== doctorId) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists'
        });
      }
    }

    // Update user data if provided
    if (validatedData.user) {
      const userUpdateData: any = {};
      if (validatedData.user.firstName) userUpdateData.firstName = validatedData.user.firstName;
      if (validatedData.user.lastName) userUpdateData.lastName = validatedData.user.lastName;
      if (validatedData.user.email) userUpdateData.email = validatedData.user.email;
      if (validatedData.user.phone) userUpdateData.phone = validatedData.user.phone;
      
      if (validatedData.user.password) {
        userUpdateData.passwordHash = await bcrypt.hash(validatedData.user.password, 12);
      }

      await UserDAL.update(existingDoctor.doctor.userId, userUpdateData);
    }

    // Update doctor data if provided
    if (validatedData.doctor) {
      const doctorUpdateData: any = {};
      if (validatedData.doctor.specialty) doctorUpdateData.specialty = validatedData.doctor.specialty;
      if (validatedData.doctor.licenseNumber) doctorUpdateData.licenseNumber = validatedData.doctor.licenseNumber;
      if (validatedData.doctor.status) doctorUpdateData.status = validatedData.doctor.status;
      if (validatedData.doctor.locationId !== undefined) doctorUpdateData.locationId = validatedData.doctor.locationId;

      if (Object.keys(doctorUpdateData).length > 0) {
        await DoctorDAL.updateDoctor(doctorId, doctorUpdateData);
      }
    }

    // Return updated doctor data
    const result = await DoctorDAL.getDoctorByIdWithUser(doctorId);

    return res.json({
      success: true,
      data: result,
      message: 'Doctor updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    console.error('Error updating doctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update doctor'
    });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    
    const existingDoctor = await DoctorDAL.getDoctorByIdWithUser(doctorId);
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete doctor record (this will also delete the user due to cascade)
    await DoctorDAL.deleteDoctor(doctorId);
    
    // Also delete the user record
    await UserDAL.deleteUser(existingDoctor.doctor.userId);

    return res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete doctor'
    });
  }
});

export default router;