import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { successResponse, errorResponse } from '../utils/response';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const dashboardData = await DashboardService.getDashboardData(driverId);
      return successResponse(res, dashboardData, 'Dashboard data retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to fetch dashboard data', 500, error);
    }
  }
}
