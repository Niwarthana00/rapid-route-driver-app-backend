import { query } from '../config/db';

export class CostRepository {
  static async getMaintenanceLogs(driverId: string, limit: number = 20) {
    const res = await query(
      `SELECT m.id AS maintenance_id, m.vehicle_id, da.driver_id, m.maintenance_type, m.cost AS amount, 0.00 AS liters, m.description, m.service_date AS logged_at
       FROM core.vehicle_maintenance m
       JOIN core.driver_assignments da ON m.vehicle_id = da.vehicle_id AND da.is_current = true
       WHERE da.driver_id = $1
       ORDER BY m.service_date DESC
       LIMIT $2`,
      [driverId, limit]
    );
    return res.rows;
  }

  static async getTodayFuelLiters(driverId: string) {
    return 0.00;
  }

  static async getCostTotals(driverId: string) {
    const todayRes = await query(
      `SELECT COALESCE(SUM(m.cost), 0) as today_total
       FROM core.vehicle_maintenance m
       JOIN core.driver_assignments da ON m.vehicle_id = da.vehicle_id AND da.is_current = true
       WHERE da.driver_id = $1 AND DATE(m.service_date) = CURRENT_DATE`,
      [driverId]
    );

    const monthRes = await query(
      `SELECT COALESCE(SUM(m.cost), 0) as monthly_total
       FROM core.vehicle_maintenance m
       JOIN core.driver_assignments da ON m.vehicle_id = da.vehicle_id AND da.is_current = true
       WHERE da.driver_id = $1 AND DATE_TRUNC('month', m.service_date) = DATE_TRUNC('month', CURRENT_DATE)`,
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
      `INSERT INTO core.vehicle_maintenance (id, vehicle_id, maintenance_type, cost, description, service_date)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, CURRENT_DATE)
       RETURNING id AS maintenance_id, vehicle_id, maintenance_type, cost AS amount, description, service_date AS logged_at`,
      [
        data.vehicle_id,
        data.maintenance_type,
        data.amount,
        data.description || '',
      ]
    );
    return res.rows[0];
  }
}
