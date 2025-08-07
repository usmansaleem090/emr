import { Router } from "express";
import { login, logout, verifyToken, seedData, forgotPassword, resetPassword } from "../../controllers/security-management/authController";
import { loginRateLimitMiddleware } from "../../middleware/securityMiddleware";

const router = Router();

// Public routes
router.post("/login", loginRateLimitMiddleware, login);
router.post("/logout", logout);
router.get("/verify", verifyToken);
router.post("/forgot-password", loginRateLimitMiddleware, forgotPassword);
router.post("/reset-password", loginRateLimitMiddleware, resetPassword);

// Development seed endpoint
router.post("/seed", seedData);

export { router as authRoutes };
