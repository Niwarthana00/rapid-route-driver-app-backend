import { query } from '../config/db';

export class DocumentRepository {
  static async getDriverDocuments(driverId: string) {
    const res = await query(
      `SELECT id AS document_id, driver_id, doc_type::text AS document_type, file_path AS file_url, expires_at,
              (expires_at - CURRENT_DATE) as days_remaining, 'DRIVER' as category,
              CASE 
                WHEN expires_at < CURRENT_DATE THEN 'EXPIRED'
                WHEN expires_at <= CURRENT_DATE + INTERVAL '7 days' THEN 'WARNING'
                ELSE 'VALID'
              END AS status
       FROM core.driver_documents
       WHERE driver_id = $1
       ORDER BY expires_at ASC`,
      [driverId]
    );
    return res.rows;
  }

  static async getVehicleDocuments(vehicleId: string) {
    const res = await query(
      `SELECT id AS document_id, vehicle_id, doc_type::text AS document_type, file_path AS file_url, expires_at,
              (expires_at - CURRENT_DATE) as days_remaining, 'VEHICLE' as category,
              CASE 
                WHEN expires_at < CURRENT_DATE THEN 'EXPIRED'
                WHEN expires_at <= CURRENT_DATE + INTERVAL '7 days' THEN 'WARNING'
                ELSE 'VALID'
              END AS status
       FROM core.vehicle_documents
       WHERE vehicle_id = $1
       ORDER BY expires_at ASC`,
      [vehicleId]
    );
    return res.rows;
  }

  static async getNextExpiringDocumentDays(driverId: string, vehicleId?: string) {
    const res = await query(
      `SELECT MIN(days_remaining) as next_expiry_days FROM (
        SELECT (expires_at - CURRENT_DATE) as days_remaining FROM core.driver_documents WHERE driver_id = $1
        UNION ALL
        SELECT (expires_at - CURRENT_DATE) as days_remaining FROM core.vehicle_documents WHERE vehicle_id = $2
      ) sub`,
      [driverId, vehicleId || null]
    );
    const minDays = res.rows[0]?.next_expiry_days;
    return minDays !== null && minDays !== undefined ? parseInt(minDays, 10) : 30;
  }

  static async createDriverDocument(driverId: string, documentType: string, expiresAt: string, filePath: string = '') {
    const enumMap: Record<string, string> = {
      'NIC': 'NIC',
      'LICENSE': 'LICENSE',
      'Heavy Driving License': 'LICENSE',
      'MEDICAL': 'MEDICAL',
      'Medical Fitness Certificate': 'MEDICAL',
      'BACKGROUND_CHECK': 'BACKGROUND_CHECK',
    };
    const mappedType = enumMap[documentType] || 'OTHER';

    const res = await query(
      `INSERT INTO core.driver_documents (id, driver_id, doc_type, file_path, issued_at, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_DATE, $4)
       RETURNING id AS document_id, driver_id, doc_type::text AS document_type, file_path AS file_url, expires_at,
                 (expires_at - CURRENT_DATE) as days_remaining`,
      [driverId, mappedType, filePath, expiresAt]
    );
    const row = res.rows[0];
    if (row) {
      const diff = parseInt(row.days_remaining || '30', 10);
      row.status = diff < 0 ? 'EXPIRED' : diff <= 7 ? 'WARNING' : 'VALID';
    }
    return row;
  }

  static async createVehicleDocument(vehicleId: string, documentType: string, expiresAt: string, filePath: string = '') {
    const enumMap: Record<string, string> = {
      'REVENUE_LICENSE': 'REVENUE_LICENSE',
      'Revenue License (Western Province)': 'REVENUE_LICENSE',
      'INSURANCE': 'INSURANCE',
      'Passenger Insurance Policy': 'INSURANCE',
      'FITNESS': 'FITNESS',
      'EMISSION': 'EMISSION',
      'Emission Test Certificate': 'EMISSION',
      'ROUTE_PERMIT': 'ROUTE_PERMIT',
    };
    const mappedType = enumMap[documentType] || 'REVENUE_LICENSE';

    const res = await query(
      `INSERT INTO core.vehicle_documents (id, vehicle_id, doc_type, file_path, issued_at, expires_at)
       VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_DATE, $4)
       RETURNING id AS document_id, vehicle_id, doc_type::text AS document_type, file_path AS file_url, expires_at,
                 (expires_at - CURRENT_DATE) as days_remaining`,
      [vehicleId, mappedType, filePath, expiresAt]
    );
    const row = res.rows[0];
    if (row) {
      const diff = parseInt(row.days_remaining || '30', 10);
      row.status = diff < 0 ? 'EXPIRED' : diff <= 7 ? 'WARNING' : 'VALID';
    }
    return row;
  }
}
