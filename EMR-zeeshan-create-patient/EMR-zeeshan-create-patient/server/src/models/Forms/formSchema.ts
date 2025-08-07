import {
  pgTable,
  serial,
  text,
  jsonb,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { users } from "../securitySchema";

// --- FORM TEMPLATES TABLE ---

export const formTemplatesSchema = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fields: jsonb("fields").notNull(), // [{ name, label, type, required }]
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- FORM SUBMISSIONS TABLE ---

export const formSubmissionsSchema = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formTemplateId: integer("form_template_id")
    .references(() => formTemplatesSchema.id)
    .notNull(),
  values: jsonb("values").notNull(), // [{ key, value }]
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Form field structure
export const formFieldValidation = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum([
    "text",
    "email",
    "number",
    "textarea",
    "date",
    "checkbox",
    "radio",
    "select",
  ]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const formTemplateValidation = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(formFieldValidation),
});

// Submission values structure
export const submissionValueValidation = z.object({
  key: z.string(),
  value: z.any(),
});

export const formSubmissionValidation = z.object({
  formTemplateId: z.number(),
  values: z.array(submissionValueValidation),
  userId: z.number().optional(),
});
