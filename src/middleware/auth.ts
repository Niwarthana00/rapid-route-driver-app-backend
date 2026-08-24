import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';

export interface DriverJwtPayload {
  driver_id: string;
  email: string;
  phone: string;
  nic_number: string;
}

declare global {
  namespace Express {
    interface Request {
      driver?: DriverJwtPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as DriverJwtPayload;

    req.driver = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Unauthorized: Invalid or expired token', 401, error);
  }
};
