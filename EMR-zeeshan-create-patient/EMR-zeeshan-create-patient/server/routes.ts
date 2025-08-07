import type { Express } from "express";
import { createServer, type Server } from "http";
import securityRoutes from "./src/routes/securityRoutes";
import { authRoutes } from "./src/routes/security-management/authRoutes";
import doctorsRouter from "./src/routes/doctors";
import doctorSchedulesRouter from "./src/routes/doctor-schedules";
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  xssProtection
} from "./src/middleware/securityMiddleware";

export async function registerRoutes(expressApp: Express): Promise<Server> {
  // Trust proxy for rate limiting in Replit environment
  expressApp.set('trust proxy', 1);

  // Security middleware
  expressApp.use(helmetMiddleware);
  expressApp.use(corsMiddleware);
  expressApp.use(rateLimitMiddleware);
  expressApp.use(xssProtection);

  // Consolidated Security Routes
  expressApp.use("/api", securityRoutes);
  
  // Auth Routes (for token verification without authentication)
  expressApp.use("/api/auth", authRoutes);
  
  // Consolidated Clinic Management Routes
  const clinicManagementRouter = await import('./src/routes/clinic-management/clinicRoutes').then(m => m.default);
  expressApp.use("/api", clinicManagementRouter);

  expressApp.use("/api/doctors", doctorsRouter);
  expressApp.use("/api/doctor-schedules", doctorSchedulesRouter);

  // Import and use patients routes
  const patientsRouter = await import('./src/routes/patients').then(m => m.default);
  expressApp.use("/api/patients", patientsRouter);

  // Import and use appointments routes
  const appointmentsRouter = await import('./src/routes/appointments').then(m => m.default);
  expressApp.use("/api/appointments", appointmentsRouter);

  // Import and use tasks routes
  const tasksRouter = await import('./src/routes/tasks').then(m => m.default);
  expressApp.use("/api/tasks", tasksRouter);

  // Import and use email test routes
  const emailTestRouter = await import('./src/routes/email-test').then(m => m.default);
  expressApp.use("/api/email", emailTestRouter);

  // Import and use schedules routes
  const schedulesRouter = await import('./src/routes/schedules').then(m => m.default);
  expressApp.use("/api/schedules", schedulesRouter);

  const httpServer = createServer(expressApp);
  return httpServer;
}
