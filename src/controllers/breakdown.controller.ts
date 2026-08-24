import { Request, Response, NextFunction } from 'express';
import { BreakdownService } from '../services/breakdown.service';
import { successResponse, errorResponse } from '../utils/response';

export class BreakdownController {
  static async reportBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { reason, location, notes, trip_id } = req.body;
      const result = await BreakdownService.reportBreakdown(driverId, reason, location, notes, trip_id);
      return successResponse(res, result, 'Emergency breakdown alert broadcasted successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to report breakdown', 400, error);
    }
  }
}
