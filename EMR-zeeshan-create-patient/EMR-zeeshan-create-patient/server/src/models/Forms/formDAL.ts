// src/dal/formDAL.ts
import { db } from "../../../db";
import {
  formTemplatesSchema,
  formSubmissionsSchema,
  formTemplateValidation,
  formSubmissionValidation,
} from "./formSchema";
import { eq, ilike, InferInsertModel } from "drizzle-orm";

import { z } from "zod";

export class FormDAL {
  // --- FORM TEMPLATES ---

  static async createTemplate(
    data: InferInsertModel<typeof formTemplatesSchema>
  ) {
    return db.insert(formTemplatesSchema).values(data).returning();
  }

  static async getAllTemplates({
    search = "",
    limit = 10,
    offset = 0,
  }: {
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    return db
      .select()
      .from(formTemplatesSchema)
      .where(ilike(formTemplatesSchema.title, `%${search}%`))
      .limit(limit)
      .offset(offset);
  }

  static async getTemplateById(id: number) {
    return db
      .select()
      .from(formTemplatesSchema)
      .where(eq(formTemplatesSchema.id, id))
      .then((rows) => rows[0]);
  }

  static async updateTemplate(
    id: number,
    data: Partial<z.infer<typeof formTemplateValidation>>
  ) {
    return db
      .update(formTemplatesSchema)
      .set(data)
      .where(eq(formTemplatesSchema.id, id))
      .returning();
  }

  static async deleteTemplate(id: number) {
    return db.delete(formTemplatesSchema).where(eq(formTemplatesSchema.id, id));
  }

  // --- FORM SUBMISSIONS ---

  static async createSubmission(
    data: InferInsertModel<typeof formSubmissionsSchema>
  ) {
    return db.insert(formSubmissionsSchema).values(data).returning();
  }

  static async getAllSubmissions({
    formTemplateId,
    limit = 10,
    offset = 0,
  }: {
    formTemplateId?: number;
    limit?: number;
    offset?: number;
  }) {
    const whereClause = formTemplateId
      ? eq(formSubmissionsSchema.formTemplateId, formTemplateId)
      : undefined;
    return db
      .select()
      .from(formSubmissionsSchema)
      .where(whereClause)
      .limit(limit)
      .offset(offset);
  }

  static async getSubmissionById(id: number) {
    return db
      .select()
      .from(formSubmissionsSchema)
      .where(eq(formSubmissionsSchema.id, id))
      .then((rows) => rows[0]);
  }

  static async updateSubmission(
    id: number,
    data: Partial<InferInsertModel<typeof formSubmissionsSchema>>
  ) {
    return db
      .update(formSubmissionsSchema)
      .set(data)
      .where(eq(formSubmissionsSchema.id, id))
      .returning();
  }

  static async deleteSubmission(id: number) {
    return db
      .delete(formSubmissionsSchema)
      .where(eq(formSubmissionsSchema.id, id));
  }
}
