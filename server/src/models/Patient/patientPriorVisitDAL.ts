import { db } from '../../../db';
import { patientPriorVisits } from './patientPriorVisitSchema';

export class PatientPriorVisitDAL {
  static async createPriorVisit(data) {
    return db.insert(patientPriorVisits).values(data).returning();
  }
}
