import { CostRepository } from '../repositories/cost.repository';
import { DriverRepository } from '../repositories/driver.repository';

export class CostService {
  static async getCostLogs(driverId: string) {
    const [logs, totals] = await Promise.all([
      CostRepository.getMaintenanceLogs(driverId),
      CostRepository.getCostTotals(driverId),
    ]);

    return {
      today_total: totals.today_total,
      monthly_total: totals.monthly_total,
      recent_logs: logs,
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
