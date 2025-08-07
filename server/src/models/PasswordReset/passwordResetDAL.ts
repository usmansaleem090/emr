import { eq, and, gt, lt } from "drizzle-orm";
import { db } from "../../../db";
import { passwordResets, type PasswordReset, type InsertPasswordReset } from "./passwordResetSchema";
import crypto from "crypto";

export class PasswordResetDAL {
  // Create a new password reset token
  static async create(userId: number): Promise<PasswordReset> {
    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Invalidate any existing unused tokens for this user
    await db
      .update(passwordResets)
      .set({ isUsed: true })
      .where(and(
        eq(passwordResets.userId, userId),
        eq(passwordResets.isUsed, false)
      ));

    // Create new token
    const [newReset] = await db
      .insert(passwordResets)
      .values({
        userId,
        token,
        expiresAt,
        isUsed: false,
      })
      .returning();

    return newReset;
  }

  // Find valid token (not used and not expired)
  static async findValidToken(token: string): Promise<PasswordReset | null> {
    const [reset] = await db
      .select()
      .from(passwordResets)
      .where(and(
        eq(passwordResets.token, token),
        eq(passwordResets.isUsed, false),
        gt(passwordResets.expiresAt, new Date())
      ))
      .limit(1);

    return reset || null;
  }

  // Mark token as used
  static async markAsUsed(id: number): Promise<void> {
    await db
      .update(passwordResets)
      .set({ isUsed: true })
      .where(eq(passwordResets.id, id));
  }

  // Clean up expired tokens (can be called periodically)
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db
      .delete(passwordResets)
      .where(lt(passwordResets.expiresAt, new Date()));
    
    return result.rowCount || 0;
  }

  // Find all reset attempts for a user (for security monitoring)
  static async findByUserId(userId: number): Promise<PasswordReset[]> {
    return await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.userId, userId))
      .orderBy(passwordResets.createdAt);
  }
}