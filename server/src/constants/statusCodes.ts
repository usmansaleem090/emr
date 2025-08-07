// User-friendly status code names for common operations
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  
  // Server Errors
  SERVER_ERROR: 500,
} as const;
