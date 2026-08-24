import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { successResponse, errorResponse } from '../utils/response';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const profile = await ProfileService.getProfile(driverId);
      return successResponse(res, profile, 'Driver profile retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to fetch profile', 500, error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const updatedProfile = await ProfileService.updateProfile(driverId, req.body);
      return successResponse(res, updatedProfile, 'Driver profile updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to update profile', 400, error);
    }
  }
}
