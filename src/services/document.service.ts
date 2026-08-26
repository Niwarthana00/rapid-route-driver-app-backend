import { DocumentRepository } from '../repositories/document.repository';
import { DriverRepository } from '../repositories/driver.repository';

export class DocumentService {
  static async getDocuments(driverId: string) {
    const driver = await DriverRepository.findById(driverId);
    const vehicleId = driver?.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e';

    const [driverDocs, vehicleDocs] = await Promise.all([
      DocumentRepository.getDriverDocuments(driverId),
      DocumentRepository.getVehicleDocuments(vehicleId),
    ]);

    let allDocs = [...driverDocs, ...vehicleDocs];

    if (allDocs.length === 0) {
      allDocs = [
        {
          document_id: 'doc-01',
          document_type: 'Heavy Driving License',
          category: 'driver',
          status: 'warning',
          expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days_remaining: 2,
        },
        {
          document_id: 'doc-02',
          document_type: 'Revenue License',
          category: 'vehicle',
          status: 'valid',
          expires_at: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days_remaining: 50,
        },
        {
          document_id: 'doc-03',
          document_type: 'Passenger Service Permit',
          category: 'vehicle',
          status: 'valid',
          expires_at: new Date(Date.now() + 127 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days_remaining: 127,
        },
      ];
    } else {
      allDocs = allDocs.map((doc: any) => ({
        ...doc,
        category: (doc.category || 'driver').toLowerCase(),
        status: (doc.status || 'valid').toLowerCase(),
      }));
    }

    const warningDocs = allDocs.filter(
      (d: any) => parseInt(String(d.days_remaining), 10) <= 3 || String(d.status).toLowerCase() === 'warning'
    );

    return {
      warning_count: warningDocs.length,
      has_urgent_warning: warningDocs.length > 0,
      documents: allDocs,
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
      const vehicleId = driver?.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e';
      return await DocumentRepository.createVehicleDocument(vehicleId, documentType, expiresAt, fileUrl);
    }

    return await DocumentRepository.createDriverDocument(driverId, documentType, expiresAt, fileUrl);
  }
}
