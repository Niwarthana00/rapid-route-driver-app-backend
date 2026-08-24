import { query } from '../config/db';

export class CostRepository {
  static async getMaintenanceLogs(driverId: string, limit: number = 20) {
    const res = await query(
      `SELECT maintenance_id, vehicle_id, driver_id, maintenance_type, amount, liters, description, logged_at
       FROM core.vehicle_maintenance
       WHERE driver_id = $1
       ORDER BY logged_at DESC
       LIMIT $2`,
      [driverId, limit]
    );
    return res.rows;
  }

  static async getTodayFuelLiters(driverId: string) {
    const res = await query(
      `SELECT COALESCE(SUM(liters), 0) as today_liters
       FROM core.vehicle_maintenance
       WHERE driver_id = $1 AND maintenance_type = 'FUEL' AND DATE(logged_at) = CURRENT_DATE`,
      [driverId]
    );
    return parseFloat(res.rows[0]?.today_liters || '0');
  }

  static async getCostTotals(driverId: string) {
    const todayRes = await query(
      `SELECT COALESCE(SUM(amount), 0) as today_total
       FROM core.vehicle_maintenance
       WHERE driver_id = $1 AND DATE(logged_at) = CURRENT_DATE`,
      [driverId]
    );

    const monthRes = await query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_total
       FROM core.vehicle_maintenance
       WHERE driver_id = $1 AND DATE_TRUNC('month', logged_at) = DATE_TRUNC('month', CURRENT_DATE)`,
      [driverId]
    );

    return {
      today_total: parseFloat(todayRes.rows[0]?.today_total || '0'),
      monthly_total: parseFloat(monthRes.rows[0]?.monthly_total || '0'),
    };
  }

  static async createMaintenanceLog(data: {
    vehicle_id: string;
    driver_id: string;
    maintenance_type: 'FUEL' | 'REPAIR';
    amount: number;
    liters?: number;
    description?: string;
  }) {
    const res = await query(
      `INSERT INTO core.vehicle_maintenance (vehicle_id, driver_id, maintenance_type, amount, liters, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.vehicle_id,
        data.driver_id,
        data.maintenance_type,
        data.amount,
        data.liters || 0,
        data.description || '',
      ]
    );
    return res.rows[0];
  }
}
