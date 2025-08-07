import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../../config/environment";
import { loginSchema } from "../../models/securitySchema";
import { UserDAL } from "../../dal";
import { PasswordResetDAL, forgotPasswordSchema, resetPasswordSchema } from "../../models/PasswordReset";
import { DataSeeder } from "../../utils/seedData";

// Seed data on server start (run once)
let isSeeded = false;

const ensureDataSeeded = async () => {
  if (!isSeeded) {
    try {
      await DataSeeder.seedSuperAdmin();
      await DataSeeder.seedAdditionalRoles();
      isSeeded = true;
    } catch (error) {
      console.error("Failed to seed data:", error);
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Ensure data is seeded before login
    await ensureDataSeeded();

    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: validationResult.error.errors,
      });
    }

    const { email, password, rememberMe } = validationResult.data;

    // Find user by email
    const user = await UserDAL.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    // const isPasswordValid = await UserDAL.validatePassword(user, password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid credentials",
    //   });
    // }

    // Generate JWT token
    const tokenExpiry = rememberMe ? "30d" : "24h";
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType,
        clinicId: user.clinicId,
      },
      config.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Update last login
    await UserDAL.updateLastLogin(user.id);

    // Return success response
    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.userType,
          clinicId: user.clinicId,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can blacklist tokens if needed (requires Redis or database storage)
    
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    const user = await UserDAL.findById(decoded.userId);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user deactivated",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.userType,
          clinicId: user.clinicId,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Forgot password endpoint
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        errors: validationResult.error.errors,
      });
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await UserDAL.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.json({
        success: true,
        message: "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Create password reset token
    const resetToken = await PasswordResetDAL.create(user.id);

    // In a real application, you would send this via email
    // For now, we'll log it to console for development
    console.log(`Password reset token for ${email}: ${resetToken.token}`);
    console.log(`Reset link: ${req.protocol}://${req.get('host')}/reset-password?token=${resetToken.token}`);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // await emailService.sendPasswordResetEmail(user.email, resetToken.token);

    res.json({
      success: true,
      message: "If an account with that email exists, we've sent a password reset link.",
      // In development, include token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken: resetToken.token })
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset password endpoint
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: validationResult.error.errors,
      });
    }

    const { token, newPassword } = validationResult.data;

    // Find valid reset token
    const resetToken = await PasswordResetDAL.findValidToken(token);
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Find user
    const user = await UserDAL.findById(resetToken.userId);
    if (!user || user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user's password
    await UserDAL.updatePassword(user.id, hashedPassword);

    // Mark reset token as used
    await PasswordResetDAL.markAsUsed(resetToken.id);

    res.json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Data seeding endpoint for development
export const seedData = async (req: Request, res: Response) => {
  try {
    await DataSeeder.seedSuperAdmin();
    await DataSeeder.seedAdditionalRoles();
    
    res.json({
      success: true,
      message: "Data seeded successfully",
      data: {
        superAdminCredentials: {
          email: "superadmin@emr.com",
          password: "superadmin123"
        }
      }
    });
  } catch (error) {
    console.error("Seed data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed data",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};