import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../constants/statusCodes";
import { MESSAGES } from "../constants/messages";
import { createResponse } from "../utils/helpers";

interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  userType: string;
  clinicId: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createResponse(false, MESSAGES.AUTH.TOKEN_MISSING)
      );
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "emr_jwt_secret_fallback_key_for_development"
    ) as JwtPayload;

    // Set individual properties for backward compatibility
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;
    (req as any).username = decoded.username;
    (req as any).userType = decoded.userType;
    (req as any).clinicId = decoded.clinicId;
    
    // Also set user object for easier access
    (req as any).user = {
      id: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      userType: decoded.userType,
      clinicId: decoded.clinicId
    };

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createResponse(false, MESSAGES.AUTH.TOKEN_INVALID)
    );
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createResponse(false, MESSAGES.AUTH.INSUFFICIENT_PERMISSIONS)
      );
    }
    
    next();
  };
};

export const requireSuperadmin = (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Check if user is superadmin based on username or userType
    const isSuperadmin = req.username === 'superadmin' || 
                        req.userType === 'SuperAdmin' || 
                        req.userType === 'Superadmin' || 
                        req.userType === 'Admin';
    
    if (!isSuperadmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superadmin privileges required.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authorization check failed',
    });
  }
};

// Alias for consistency
export const authenticateToken = authMiddleware;
