import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔑 Login Request Received:', req.body);
      const { identifier, password } = req.body;
      const data = await AuthService.login(identifier, password);
      return successResponse(res, data, 'Login successful');
    } catch (error: any) {
      console.error('❌ Login Error:', error);
      return errorResponse(res, error.message || 'Login failed', 401, error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('📝 Registration Request Received:', req.body);
      const data = await AuthService.register(req.body);
      const isPassenger = req.body.user_type === 'PASSENGER';
      return successResponse(
        res,
        data,
        `${isPassenger ? 'Passenger' : 'Driver'} registered successfully`,
        201
      );
    } catch (error: any) {
      console.error('❌ Registration Error:', error);
      return errorResponse(res, error.message || 'Registration failed', 400, error);
    }
  }
}
