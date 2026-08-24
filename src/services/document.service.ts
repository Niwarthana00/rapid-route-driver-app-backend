import { DocumentRepository } from '../repositories/document.repository';
import { DriverRepository } from '../repositories/driver.repository';

export class DocumentService {
  static async getDocuments(driverId: string) {
    const driver = await DriverRepository.findById(driverId);
    const vehicleId = driver?.assigned_vehicle_id || 'veh-138-01';

    const [driverDocs, vehicleDocs] = await Promise.all([
      DocumentRepository.getDriverDocuments(driverId),
      DocumentRepository.getVehicleDocuments(vehicleId),
    ]);

    const allDocs = [...driverDocs, ...vehicleDocs];
    const warningDocs = allDocs.filter(d => parseInt(d.days_remaining, 10) <= 3 || d.status === 'WARNING');

    return {
      documents: allDocs,
      warning_count: warningDocs.length,
      has_urgent_warning: warningDocs.length > 0,
    };
  }

  static async uploadDocument(
    driverId: string,
    documentType: string,
    expiresAt: string,
    fileUrl: string = '',
    category: 'DRIVER' | 'VEHICLE' = 'DRIVER'
  ) {
    if (category === 'VEHICLE') {
      const driver = await DriverRepository.findById(driverId);
      const vehicleId = driver?.assigned_vehicle_id || 'veh-138-01';
      return await DocumentRepository.createVehicleDocument(vehicleId, documentType, expiresAt, fileUrl);
    }

    return await DocumentRepository.createDriverDocument(driverId, documentType, expiresAt, fileUrl);
  }
}
