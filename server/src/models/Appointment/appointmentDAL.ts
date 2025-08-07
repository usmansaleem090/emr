import { db } from '../../../db';
import { appointments, SelectAppointment, InsertAppointment, AppointmentWithDetails } from './appointmentSchema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export class AppointmentDAL {
  // Create a new appointment
  static async createAppointment(appointmentData: InsertAppointment): Promise<SelectAppointment> {
    const [appointment] = await db.insert(appointments).values(appointmentData).returning();
    return appointment;
  }

  // Get appointment by ID with details
  static async getAppointmentById(id: number): Promise<AppointmentWithDetails | null> {
    const result = await db.execute(`
      SELECT 
        a.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as patient_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as doctor_name,
        cl.name as location_name,
        c.name as clinic_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u2 ON d.user_id = u2.id
      JOIN clinic_locations cl ON a.location_id = cl.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.id = ${id}
    `);
    
    return result.rows[0] as AppointmentWithDetails || null;
  }

  // Get appointments for a clinic with details
  static async getClinicAppointments(clinicId: number, locationId?: number): Promise<AppointmentWithDetails[]> {
    let query = `
      SELECT 
        a.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as patient_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as doctor_name,
        cl.name as location_name,
        c.name as clinic_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u1 ON p.user_id = u1.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u2 ON d.user_id = u2.id
      JOIN clinic_locations cl ON a.location_id = cl.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.clinic_id = ${clinicId}
    `;
    
    if (locationId) {
      query += ` AND a.location_id = ${locationId}`;
    }
    
    query += ` ORDER BY a.appointment_date DESC, a.start_time DESC`;
    
    const result = await db.execute(query);
    return result.rows as AppointmentWithDetails[];
  }

  // Get doctor's appointments for a specific date
  static async getDoctorAppointments(doctorId: number, date: string): Promise<SelectAppointment[]> {
    const result = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, date),
        eq(appointments.status, 'scheduled')
      ));
    
    return result;
  }

  // Get doctor appointments by date with start time for slot checking
  static async getAppointmentsByDoctorAndDate(doctorId: number, date: string) {
    const result = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status
      })
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, doctorId),
        eq(appointments.appointmentDate, date)
      ));
    
    return result;
  }

  // Check for appointment conflicts
  static async checkAppointmentConflict(
    doctorId: number, 
    date: string, 
    startTime: string, 
    endTime: string,
    excludeAppointmentId?: number
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count
      FROM appointments 
      WHERE doctor_id = ${doctorId}
      AND appointment_date = '${date}'
      AND status = 'scheduled'
      AND (
        (start_time <= '${startTime}' AND end_time > '${startTime}') OR
        (start_time < '${endTime}' AND end_time >= '${endTime}') OR
        (start_time >= '${startTime}' AND end_time <= '${endTime}')
      )
    `;
    
    if (excludeAppointmentId) {
      query += ` AND id != ${excludeAppointmentId}`;
    }
    
    const result = await db.execute(query);
    return (result.rows[0] as any).count > 0;
  }

  // Update appointment
  static async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<SelectAppointment | null> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    
    return appointment || null;
  }

  // Delete appointment
  static async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Get available time slots for a doctor on a specific date (simplified version)
  static async getAvailableSlots(
    doctorId: number, 
    date: string, 
    locationId: number
  ): Promise<string[]> {
    // Generate all possible slots (9 AM to 5 PM, 30-minute slots)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    // Get existing appointments for this doctor on this date
    const existingAppointments = await AppointmentDAL.getAppointmentsByDoctorAndDate(doctorId, date);
    
    // Filter out booked slots
    const bookedSlots = existingAppointments.map((apt: any) => apt.startTime);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    return availableSlots;
  }
}