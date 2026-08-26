import { TripRepository } from '../repositories/trip.repository';
import { DriverRepository } from '../repositories/driver.repository';
import { CostRepository } from '../repositories/cost.repository';
import { ROUTE_138, routeHaltsStore, RouteHalt } from '../constants/routes';

export class TripService {
  static async getActiveHalts(driverId: string, customRouteId?: string) {
    const activeTrip = await TripRepository.getActiveTripForDriver(driverId);
    const driverRouteInfo = !activeTrip ? await TripRepository.getDriverRouteInfo(driverId) : null;
    
    const routeId = customRouteId || activeTrip?.route_id || driverRouteInfo?.route_id || ROUTE_138.route_id;
    const routeNumber = activeTrip?.route_number || driverRouteInfo?.route_number || ROUTE_138.route_number;
    const routeName = activeTrip?.route_name || driverRouteInfo?.route_name || ROUTE_138.route_name;
    const currentHaltIndex = activeTrip?.current_halt_index !== undefined ? activeTrip.current_halt_index : 0;
    const tripId = activeTrip?.trip_id || 'trip-active-01';

    let halts: any[] = [];
    if (customRouteId) {
      halts = await TripRepository.getHaltsByRouteId(customRouteId);
    } else {
      // 1. Try fetching via driver's active schedule / trips in DB
      halts = await TripRepository.getActiveRouteHaltsForDriver(driverId);
      // 2. If not found, try by routeId in DB
      if (halts.length === 0 && routeId) {
        halts = await TripRepository.getHaltsByRouteId(routeId);
      }
    }

    // 3. Fallback to constant / stored halts if database table had no records
    if (halts.length === 0) {
      halts = routeHaltsStore.get(routeId) || ROUTE_138.halts;
    }

    return {
      trip_id: tripId,
      route_id: routeId,
      route_number: routeNumber,
      route_name: routeName,
      current_halt_index: currentHaltIndex,
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
      targetVehicleId = driver?.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e';
    }

    return await TripRepository.startTrip(driverId, targetVehicleId || '8ff56887-33fa-411c-bcca-b3f95b5f089e', routeId);
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

    const totalPassengers = completedTrip.passenger_count || 42;
    const distanceKm = 15.2;

    return {
      trip_id: completedTrip.trip_id,
      status: completedTrip.status,
      duration_minutes: durationMinutes,
      total_duration_minutes: durationMinutes,
      completed_halts_count: completedTrip.completed_halts || 8,
      total_passengers_carried: totalPassengers,
      total_passengers: totalPassengers,
      distance_covered_km: distanceKm,
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
