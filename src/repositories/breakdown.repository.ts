import { query } from '../config/db';

export class BreakdownRepository {
  static async createBreakdownAlert(data: {
    trip_id?: string;
    driver_id: string;
    reason: string;
    location: string;
    notes?: string;
  }) {
    const isUuid = (str?: string) => str && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
    const validTripId = isUuid(data.trip_id) ? data.trip_id : null;

    try {
      const res = await query(
        `INSERT INTO biz.breakdown_alerts (trip_id, driver_id, reason, location, notes, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING *`,
        [validTripId, data.driver_id, data.reason, data.location, data.notes || '']
      );
      return res.rows[0];
    } catch (err) {
      console.warn('Breakdown alert fallback:', err);
      return {
        alert_id: 'alert-' + Date.now(),
        driver_id: data.driver_id,
        reason: data.reason,
        location: data.location,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };
    }
  }

  static async getDriverBreakdownAlerts(driverId: string) {
    const res = await query(
      `SELECT * FROM biz.breakdown_alerts WHERE driver_id = $1 ORDER BY created_at DESC`,
      [driverId]
    );
    return res.rows;
  }
}
