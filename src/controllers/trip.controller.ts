import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/trip.service';
import { successResponse, errorResponse } from '../utils/response';

export class TripController {
  static async getActiveHalts(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const data = await TripService.getActiveHalts(driverId);
      return successResponse(res, data, 'Active trip halts retrieved successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to fetch active halts', 500, error);
    }
  }

  static async updateHalt(req: Request, res: Response, next: NextFunction) {
    try {
      const { haltId } = req.params;
      const { name, sequence_no } = req.body;
      const updated = await TripService.updateHalt(haltId, name, sequence_no);
      return successResponse(res, updated, 'Halt updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to update halt', 400, error);
    }
  }

  static async startTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { route_id, vehicle_id } = req.body;
      const trip = await TripService.startTrip(driverId, route_id, vehicle_id);
      return successResponse(res, trip, 'Trip started successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to start trip', 400, error);
    }
  }

  static async completeHalt(req: Request, res: Response, next: NextFunction) {
    try {
      const { trip_id, halt_id, sequence_no, boarded_passengers } = req.body;
      const log = await TripService.completeHalt(trip_id, halt_id, sequence_no, boarded_passengers);
      return successResponse(res, log, 'Halt completed and logged successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to log halt completion', 400, error);
    }
  }

  static async finishTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { trip_id } = req.body;
      const summary = await TripService.finishTrip(trip_id, driverId);
      return successResponse(res, summary, 'Trip completed successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to finish trip', 400, error);
    }
  }

  static async pingLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const driverId = req.driver!.driver_id;
      const { trip_id, latitude, longitude, speed } = req.body;
      const ping = await TripService.pingLocation(trip_id, driverId, latitude, longitude, speed);
      return successResponse(res, ping, 'Location ping logged');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to ping location', 400, error);
    }
  }
}
