import { TripRepository } from '../repositories/trip.repository';
import { CostRepository } from '../repositories/cost.repository';
import { DocumentRepository } from '../repositories/document.repository';
import { DriverRepository } from '../repositories/driver.repository';

export class DashboardService {
  static async getDashboardData(driverId: string) {
    const driver = await DriverRepository.findById(driverId);
    const vehicleId = driver?.assigned_vehicle_id || 'veh-138-01';

    const [todayPassengers, todayFuelLiters, nextDocExpiryDays, activeTrip] = await Promise.all([
      TripRepository.getTodayPassengerTotal(driverId),
      CostRepository.getTodayFuelLiters(driverId),
      DocumentRepository.getNextExpiringDocumentDays(driverId, vehicleId),
      TripRepository.getActiveTripForDriver(driverId),
    ]);

    return {
      summary: {
        today_passengers: todayPassengers,
        today_fuel_liters: todayFuelLiters,
        next_doc_expiry_days: nextDocExpiryDays,
      },
      driver: {
        driver_id: driver?.driver_id || driverId,
        name: driver?.name || 'Driver',
        license_number: driver?.license_number || '',
      },
      vehicle: {
        vehicle_id: vehicleId,
        registration_number: driver?.registration_number || 'ND-4829',
        model: driver?.model || 'Leyland Viking 2022',
      },
      active_trip: activeTrip
        ? {
            trip_id: activeTrip.trip_id,
            status: activeTrip.status,
            route_number: activeTrip.route_number || '138',
            route_name: activeTrip.route_name || 'Pettah - Maharagama / Kottawa',
            start_location: activeTrip.start_location || 'Pettah Main Bus Stand',
            end_location: activeTrip.end_location || 'Kottawa Bus Stand',
            current_halt_index: activeTrip.current_halt_index || 1,
            passenger_count: activeTrip.passenger_count || 0,
            start_time: activeTrip.start_time,
          }
        : {
            trip_id: null,
            status: 'SCHEDULED',
            route_number: '138',
            route_name: 'Pettah - Maharagama / Kottawa',
            start_location: 'Pettah Main Bus Stand',
            end_location: 'Kottawa Bus Stand',
            current_halt_index: 1,
            passenger_count: 0,
            start_time: null,
          },
    };
  }
}
