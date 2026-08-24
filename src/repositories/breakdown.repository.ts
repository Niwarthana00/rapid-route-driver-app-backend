import { query } from '../config/db';

export class BreakdownRepository {
  static async createBreakdownAlert(data: {
    trip_id: string;
    driver_id: string;
    reason: string;
    location: string;
    notes?: string;
  }) {
    const res = await query(
      `INSERT INTO biz.breakdown_alerts (trip_id, driver_id, reason, location, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
       RETURNING *`,
      [data.trip_id, data.driver_id, data.reason, data.location, data.notes || '']
    );

    // Optional: mark trip status or update trip logs if needed
    return res.rows[0];
  }

  static async getDriverBreakdownAlerts(driverId: string) {
    const res = await query(
      `SELECT * FROM biz.breakdown_alerts WHERE driver_id = $1 ORDER BY created_at DESC`,
      [driverId]
    );
    return res.rows;
  }
}
