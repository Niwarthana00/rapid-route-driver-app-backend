import { Request, Response, NextFunction } from 'express';
import { CostService } from '../services/cost.service';
import { successResponse, errorResponse } from '../utils/response';

export class CostController {
  static async getCosts(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const data = await CostService.getCostLogs(driverId);
      return successResponse(res, data, 'Costs retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to fetch costs', 500, error);
    }
  }

  static async logCost(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { maintenance_type, amount, liters, description } = req.body;
      const result = await CostService.logCost(driverId, maintenance_type, amount, liters, description);
      return successResponse(res, result, 'Cost logged successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to log expense', 400, error);
    }
  }
}
