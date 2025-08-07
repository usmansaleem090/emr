import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import { config } from "../config/environment";

// CORS middleware
export const corsMiddleware = cors({
  origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN.split(","),
  credentials: true,
  optionsSuccessStatus: 200,
});

// Helmet security middleware
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
});

// Login rate limiting middleware
export const loginRateLimitMiddleware = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_ATTEMPTS, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
    retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutes
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting in development environment for testing
    return config.NODE_ENV === "development";
  },
});

// General API rate limiting middleware
export const generalRateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return config.NODE_ENV === "development";
  },
});

// Alias for compatibility
export const rateLimitMiddleware = generalRateLimitMiddleware;

// XSS Protection middleware
export const xssProtection = (req: any, res: any, next: any) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};