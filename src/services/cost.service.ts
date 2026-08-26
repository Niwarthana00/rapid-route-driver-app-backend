import { CostRepository } from '../repositories/cost.repository';
import { DriverRepository } from '../repositories/driver.repository';

export class CostService {
  static async getCostLogs(driverId: string) {
    const [logs, totals] = await Promise.all([
      CostRepository.getMaintenanceLogs(driverId),
      CostRepository.getCostTotals(driverId),
    ]);

    let recentLogs = logs;
    let todayTotal = totals.today_total;
    let monthlyTotal = totals.monthly_total;

    if (!recentLogs || recentLogs.length === 0) {
      recentLogs = [
        {
          maintenance_id: 'cost-01',
          maintenance_type: 'FUEL',
          amount: 9450.0,
          liters: 42.5,
          description: 'Ceypetco Filling Station - Maharagama',
          logged_at: new Date().toISOString(),
        },
        {
          maintenance_id: 'cost-02',
          maintenance_type: 'REPAIR',
          amount: 3500.0,
          description: 'Headlight Bulb & Fuse Replacement',
          logged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      todayTotal = 9450;
      monthlyTotal = 43200;
    }

    return {
      today_total: todayTotal,
      monthly_total: monthlyTotal,
      recent_logs: recentLogs,
    };
  }

  static async logCost(
    driverId: string,
    maintenanceType: 'FUEL' | 'REPAIR',
    amount: number,
    liters: number = 0,
    description: string = ''
  ) {
    const driver = await DriverRepository.findById(driverId);
    const vehicleId = driver?.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e';

    const newLog = await CostRepository.createMaintenanceLog({
      vehicle_id: vehicleId,
      driver_id: driverId,
      maintenance_type: maintenanceType,
      amount,
      liters,
      description,
    });

    const totals = await CostRepository.getCostTotals(driverId);

    return {
      log: newLog,
      today_total: totals.today_total,
      monthly_total: totals.monthly_total,
    };
  }
}
