import { Response } from 'express';
import { HTTP_STATUS } from '../constants/statusCodes';

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

export class ResponseHelper {
  static send(
    res: Response, 
    success: boolean, 
    message: string, 
    statusCode: number = HTTP_STATUS.OK,
    data?: any,
    errors?: any
  ): Response {
    const response: ApiResponse = {
      success,
      message,
      ...(data && { data }),
      ...(errors && { errors })
    };
    
    return res.status(statusCode).json(response);
  }

  // Convenience methods for common responses
  static success(res: Response, message: string, data?: any, statusCode: number = HTTP_STATUS.OK): Response {
    return this.send(res, true, message, statusCode, data);
  }

  static error(res: Response, message: string, statusCode: number = HTTP_STATUS.SERVER_ERROR, errors?: any): Response {
    return this.send(res, false, message, statusCode, undefined, errors);
  }
} 