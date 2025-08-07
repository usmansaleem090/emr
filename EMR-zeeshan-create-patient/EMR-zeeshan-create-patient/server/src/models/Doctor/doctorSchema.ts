import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./../securitySchema";
import { clinics } from "../clinicSchema";
import { clinicLocations } from "../clinicSchema";

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: "cascade" }),
  locationId: integer("location_id").references(() => clinicLocations.id, { onDelete: "set null" }),
  specialty: text("specialty").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDoctorSchema = createInsertSchema(doctors, {
  specialty: z.string().min(1, "Specialty is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectDoctorSchema = createSelectSchema(doctors);

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;