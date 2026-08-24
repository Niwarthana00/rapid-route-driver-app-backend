import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      const data = await AuthService.login(identifier, password);
      return successResponse(res, data, 'Login successful');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Login failed', 401, error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.register(req.body);
      return successResponse(res, data, 'Driver registered successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Registration failed', 400, error);
    }
  }
}
