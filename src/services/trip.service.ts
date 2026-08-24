import { TripRepository } from '../repositories/trip.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { CostRepository } from '../repositories/cost.repository';
import { ROUTE_138, routeHaltsStore, RouteHalt } from '../constants/routes';

export class TripService {
  static async getActiveHalts(driverId: string) {
    const activeTrip = await TripRepository.getActiveTripForDriver(driverId);
    const routeId = activeTrip?.route_id || ROUTE_138.route_id;

    const halts = routeHaltsStore.get(routeId) || ROUTE_138.halts;

    return {
      trip_id: activeTrip?.trip_id || 'trip-active-01',
      route_id: routeId,
      current_halt_index: activeTrip?.current_halt_index || 1,
      halts,
    };
  }

  static async updateHalt(haltId: string, name?: string, sequenceNo?: number) {
    const halts = routeHaltsStore.get(ROUTE_138.route_id) || [...ROUTE_138.halts];
    const haltIndex = halts.findIndex((h) => h.halt_id === haltId);

    if (haltIndex === -1) {
      throw new Error(`Halt with ID ${haltId} not found`);
    }

    if (name) halts[haltIndex].name = name;
    if (sequenceNo) halts[haltIndex].sequence_no = sequenceNo;

    routeHaltsStore.set(ROUTE_138.route_id, halts);
    return halts[haltIndex];
  }

  static async startTrip(driverId: string, routeId: string = 'route-138', vehicleId?: string) {
    const activeTrip = await TripRepository.getActiveTripForDriver(driverId);
    if (activeTrip && activeTrip.status === 'IN_PROGRESS') {
      return activeTrip;
    }

    let targetVehicleId = vehicleId;
    if (!targetVehicleId) {
      const driver = await DriverRepository.findById(driverId);
      targetVehicleId = driver?.assigned_vehicle_id || 'veh-138-01';
    }

    return await TripRepository.startTrip(driverId, targetVehicleId || 'veh-138-01', routeId);
  }

  static async completeHalt(tripId: string, haltId: string, sequenceNo: number, boardedPassengers: number = 0) {
    return await TripRepository.logHaltCompletion(tripId, haltId, sequenceNo, boardedPassengers);
  }

  static async finishTrip(tripId: string, driverId: string) {
    const completedTrip = await TripRepository.completeTrip(tripId);
    if (!completedTrip) throw new Error('Trip not found or already finished');

    const costTotals = await CostRepository.getCostTotals(driverId);

    let durationMinutes = 45;
    if (completedTrip.start_time && completedTrip.end_time) {
      const diffMs = new Date(completedTrip.end_time).getTime() - new Date(completedTrip.start_time).getTime();
      durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    }

    return {
      trip_id: completedTrip.trip_id,
      status: completedTrip.status,
      duration_minutes: durationMinutes,
      completed_halts_count: completedTrip.completed_halts || 8,
      total_passengers_carried: completedTrip.passenger_count || 42,
      start_time: completedTrip.start_time,
      end_time: completedTrip.end_time,
      costs_summary: {
        today_total: costTotals.today_total,
        monthly_total: costTotals.monthly_total,
      },
    };
  }

  static async pingLocation(tripId: string, driverId: string, latitude: number, longitude: number, speed: number = 0) {
    return {
      trip_id: tripId,
      driver_id: driverId,
      latitude,
      longitude,
      speed,
      timestamp: new Date().toISOString(),
      status: 'STREAMING',
    };
  }
}
