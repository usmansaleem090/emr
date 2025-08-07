import { db } from '../../../db';
import { patientVitals, InsertPatientVitals, UpdatePatientVitals, PatientVitals } from './patientVitalsSchema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export class PatientVitalsDAL {
  // Calculate BMI: weight (kg) / (height (m))²
  private static calculateBMI(weight: number, height: number): number {
    if (!weight || !height || height <= 0) return 0;
    const heightInMeters = height / 100; // Convert cm to meters
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
  }

  // Create new vitals record
  static async createVitals(data: InsertPatientVitals): Promise<PatientVitals> {
    // Calculate BMI if both height and weight are provided
    let bmi = null;
    if (data.height && data.weight) {
      const heightNum = typeof data.height === 'string' ? parseFloat(data.height) : data.height;
      const weightNum = typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight;
      bmi = this.calculateBMI(weightNum, heightNum);
    }

    // Prepare data for database insertion
    const dbData: any = { ...data };
    
    // Convert height and weight to proper decimal format if they are numbers
    if (typeof data.height === 'number') {
      dbData.height = parseFloat(data.height.toFixed(2));
    }
    if (typeof data.weight === 'number') {
      dbData.weight = parseFloat(data.weight.toFixed(2));
    }
    if (typeof data.temperature === 'number') {
      dbData.temperature = parseFloat(data.temperature.toFixed(1));
    }
    

    const [vitals] = await db.insert(patientVitals).values({
      ...dbData,
      bmi: bmi ? bmi.toString() : null
    }).returning();

    return vitals;
  }

  // Get vitals by ID
  static async getVitalsById(id: number): Promise<PatientVitals | null> {
    const result = await db.select().from(patientVitals)
      .where(eq(patientVitals.id, id));
    return result[0] || null;
  }

  // Get all vitals for a patient
  static async getVitalsByPatientId(patientId: number): Promise<PatientVitals[]> {
    return await db.select().from(patientVitals)
      .where(eq(patientVitals.patientId, patientId))
      .orderBy(desc(patientVitals.date));
  }

  // Get latest vitals for a patient
  static async getLatestVitalsByPatientId(patientId: number): Promise<PatientVitals | null> {
    const result = await db.select().from(patientVitals)
      .where(eq(patientVitals.patientId, patientId))
      .orderBy(desc(patientVitals.date))
      .limit(1);
    return result[0] || null;
  }

  // Get vitals by date range
  static async getVitalsByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientVitals[]> {
    return await db.select().from(patientVitals)
      .where(
        and(
          eq(patientVitals.patientId, patientId),
          gte(patientVitals.date, startDate.toISOString()),
          lte(patientVitals.date, endDate.toISOString())
        )
      )
      .orderBy(desc(patientVitals.date));
  }

  // Update vitals
  static async updateVitals(id: number, data: UpdatePatientVitals): Promise<PatientVitals | null> {
    // Recalculate BMI if height or weight changed
    let bmi = null;
    if (data.height || data.weight) {
      const existingVitals = await this.getVitalsById(id);
      if (existingVitals) {
        const newHeight = data.height ? (typeof data.height === 'string' ? parseFloat(data.height) : data.height) : Number(existingVitals.height);
        const newWeight = data.weight ? (typeof data.weight === 'string' ? parseFloat(data.weight) : data.weight) : Number(existingVitals.weight);
        if (newHeight && newWeight) {
          bmi = this.calculateBMI(newWeight, newHeight);
        }
      }
    }

    // Prepare data for database update
    const dbData: any = { ...data };
    
    // Convert height and weight to proper decimal format if they are numbers
    if (typeof data.height === 'number') {
      dbData.height = parseFloat(data.height.toFixed(2));
    }
    if (typeof data.weight === 'number') {
      dbData.weight = parseFloat(data.weight.toFixed(2));
    }
    if (typeof data.temperature === 'number') {
      dbData.temperature = parseFloat(data.temperature.toFixed(1));
    }
    

    const [updatedVitals] = await db.update(patientVitals)
      .set({
        ...dbData,
        bmi: bmi ? bmi.toString() : null,
        updatedAt: new Date()
      })
      .where(eq(patientVitals.id, id))
      .returning();

    return updatedVitals || null;
  }

  // Delete vitals
  static async deleteVitals(id: number): Promise<boolean> {
    const result = await db.delete(patientVitals)
      .where(eq(patientVitals.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get vitals trends (for charts/analytics)
  static async getVitalsTrends(patientId: number, days: number = 30): Promise<PatientVitals[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db.select().from(patientVitals)
      .where(
        and(
          eq(patientVitals.patientId, patientId),
          gte(patientVitals.date, startDate)
        )
      )
      .orderBy(patientVitals.date);
  }
} 