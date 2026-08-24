import { query } from '../config/db';

export class TripRepository {
  static async getActiveTripForDriver(driverId: string) {
    const res = await query(
      `SELECT t.*, v.registration_number, v.model
       FROM biz.trips t
       JOIN core.vehicles v ON t.vehicle_id = v.vehicle_id
       WHERE t.driver_id = $1 AND t.status IN ('IN_PROGRESS', 'SCHEDULED')
       ORDER BY t.created_at DESC LIMIT 1`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  static async startTrip(driverId: string, vehicleId: string, routeId: string = 'route-138') {
    const res = await query(
      `INSERT INTO biz.trips (driver_id, vehicle_id, route_id, status, start_time, current_halt_index, passenger_count)
       VALUES ($1, $2, $3, 'IN_PROGRESS', CURRENT_TIMESTAMP, 1, 0)
       RETURNING *`,
      [driverId, vehicleId, routeId]
    );
    return res.rows[0];
  }

  static async logHaltCompletion(tripId: string, haltId: string, sequenceNo: number, boardedPassengers: number) {
    const res = await query(
      `INSERT INTO biz.trip_halt_log (trip_id, halt_id, sequence_no, boarded_passengers)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tripId, haltId, sequenceNo, boardedPassengers]
    );

    // Update trip active halt index and passenger count
    await query(
      `UPDATE biz.trips
       SET current_halt_index = $1, passenger_count = passenger_count + $2
       WHERE trip_id = $3`,
      [sequenceNo + 1, boardedPassengers, tripId]
    );

    return res.rows[0];
  }

  static async completeTrip(tripId: string) {
    const res = await query(
      `UPDATE biz.trips
       SET status = 'COMPLETED', end_time = CURRENT_TIMESTAMP
       WHERE trip_id = $1
       RETURNING *`,
      [tripId]
    );

    const trip = res.rows[0];
    if (!trip) return null;

    // Get completed halts count from biz.trip_halt_log
    const haltLogRes = await query(
      `SELECT COUNT(*) as completed_halts FROM biz.trip_halt_log WHERE trip_id = $1`,
      [tripId]
    );
    const completedHalts = parseInt(haltLogRes.rows[0]?.completed_halts || '0', 10);

    return {
      ...trip,
      completed_halts: completedHalts,
    };
  }

  static async getTodayPassengerTotal(driverId: string) {
    const res = await query(
      `SELECT COALESCE(SUM(passenger_count), 0) as today_passengers
       FROM biz.trips
       WHERE driver_id = $1 AND DATE(created_at) = CURRENT_DATE`,
      [driverId]
    );
    return parseInt(res.rows[0]?.today_passengers || '0', 10);
  }
}
