import { pgTable, serial, integer, timestamp, text, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientPriorVisits = pgTable('patient_prior_visits', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  date: date('date'),
  reason: text('reason'),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  provider: text('provider'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const insertPatientPriorVisitSchema = createInsertSchema(patientPriorVisits, {
  date: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  treatment: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
