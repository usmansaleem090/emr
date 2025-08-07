import express, { type Request, Response, NextFunction } from "express";
import morgan from "morgan";
import { config, validateEnvironment } from "./config/environment";

import clinicsRouter from "./routes/clinics";
import clinicStaffRouter from "./routes/clinic-management/clinic-staff";
import { 
  corsMiddleware, 
  helmetMiddleware, 
  rateLimitMiddleware, 
  xssProtection 
} from "./middleware/securityMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";

// Validate environment configuration
validateEnvironment();

const app = express();

// Trust proxy for rate limiting in Replit environment
app.set('trust proxy', 1);

// Security middleware
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(xssProtection);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (config.NODE_ENV === "development") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("common"));
}

// API Routes

app.use("/api/clinics", clinicsRouter);
app.use("/api/clinic-staff", clinicStaffRouter);


// Error handling middleware (must be last)
app.use(errorHandler);
export default app;
