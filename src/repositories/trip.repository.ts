import { query } from '../config/db';

export class TripRepository {
  static async getActiveTripForDriver(driverId: string) {
    const res = await query(
      `SELECT 
          t.id AS trip_id,
          t.status,
          t.departed_at AS start_time,
          r.route_number,
          r.name AS route_name,
          v.registration_number,
          v.model,
          v.total_seats AS seating_capacity,
          (SELECT name FROM core.halts WHERE id = r.origin_halt_id) AS start_location,
          (SELECT name FROM core.halts WHERE id = r.destination_halt_id) AS end_location,
          1 AS current_halt_index,
          (SELECT COALESCE(COUNT(id), 0) FROM biz.bookings WHERE trip_id = t.id AND booking_status <> 'CANCELLED') AS passenger_count
       FROM biz.trips t
       JOIN biz.schedules s ON t.schedule_id = s.id
       JOIN core.routes r ON s.route_id = r.id
       JOIN core.vehicles v ON t.vehicle_id = v.id
       WHERE t.driver_id = $1 AND t.status IN ('IN_PROGRESS', 'SCHEDULED')
       ORDER BY t.created_at DESC LIMIT 1`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  static async startTrip(driverId: string, vehicleId: string, routeId: string = 'route-138') {
    const scheduleRes = await query(
      `SELECT id FROM biz.schedules 
       WHERE driver_id = $1 AND route_id = $2 AND vehicle_id = $3 AND is_active = true 
       LIMIT 1`,
      [driverId, routeId, vehicleId]
    );
    let scheduleId = scheduleRes.rows[0]?.id;

    if (!scheduleId) {
      const newScheduleRes = await query(
        `INSERT INTO biz.schedules (id, route_id, vehicle_id, driver_id, departure_time, arrival_time, days_of_week, valid_from, is_active)
         VALUES (gen_random_uuid(), $1, $2, $3, '08:00:00', '16:00:00', ARRAY[1,2,3,4,5]::SMALLINT[], CURRENT_DATE, true)
         RETURNING id`,
        [routeId, vehicleId, driverId]
      );
      scheduleId = newScheduleRes.rows[0].id;
    }

    const res = await query(
      `INSERT INTO biz.trips (id, schedule_id, vehicle_id, driver_id, trip_date, status, departed_at)
       VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_DATE, 'IN_PROGRESS', CURRENT_TIMESTAMP)
       RETURNING id AS trip_id, status, departed_at AS start_time`,
      [scheduleId, vehicleId, driverId]
    );
    return res.rows[0];
  }

  static async logHaltCompletion(tripId: string, haltId: string, sequenceNo: number, boardedPassengers: number) {
    const res = await query(
      `INSERT INTO biz.trip_halt_log (trip_id, halt_id, sequence_order, passengers_boarded, passengers_alighted)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING *`,
      [tripId, haltId, sequenceNo, boardedPassengers]
    );
    return res.rows[0];
  }

  static async completeTrip(tripId: string) {
    const res = await query(
      `UPDATE biz.trips
       SET status = 'COMPLETED', arrived_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [tripId]
    );

    const trip = res.rows[0];
    if (!trip) return null;

    const haltLogRes = await query(
      `SELECT COUNT(*) as completed_halts FROM biz.trip_halt_log WHERE trip_id = $1`,
      [tripId]
    );

    return {
      ...trip,
      completed_halts: parseInt(haltLogRes.rows[0].completed_halts || '0')
    };
  }

  static async getDriverStatsToday(driverId: string) {
    const res = await query(
      `SELECT 
         COALESCE(COUNT(b.id), 0) as today_passengers,
         COUNT(DISTINCT t.id) as today_trips
       FROM biz.trips t
       LEFT JOIN biz.bookings b ON t.id = b.trip_id AND b.booking_status <> 'CANCELLED'
       WHERE t.driver_id = $1 AND DATE(t.created_at) = CURRENT_DATE`,
      [driverId]
    );
    return res.rows[0];
  }

  static async getTodayPassengerTotal(driverId: string): Promise<number> {
    const stats = await this.getDriverStatsToday(driverId);
    return parseInt(stats?.today_passengers || '0');
  }
}
