import { query } from '../config/db';

export class DocumentRepository {
  static async getDriverDocuments(driverId: string) {
    const res = await query(
      `SELECT document_id, driver_id, document_type, file_url, expires_at, status,
              (expires_at - CURRENT_DATE) as days_remaining, 'DRIVER' as category
       FROM core.driver_documents
       WHERE driver_id = $1
       ORDER BY expires_at ASC`,
      [driverId]
    );
    return res.rows;
  }

  static async getVehicleDocuments(vehicleId: string) {
    const res = await query(
      `SELECT document_id, vehicle_id, document_type, file_url, expires_at, status,
              (expires_at - CURRENT_DATE) as days_remaining, 'VEHICLE' as category
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

  static async createDriverDocument(driverId: string, documentType: string, expiresAt: string, fileUrl: string = '') {
    // Calculate status: EXPIRED if <= 0 days, WARNING if <= 7 days, else VALID
    const statusQuery = await query(`SELECT ($1::date - CURRENT_DATE) as diff`, [expiresAt]);
    const diff = parseInt(statusQuery.rows[0]?.diff || '30', 10);
    const status = diff < 0 ? 'EXPIRED' : diff <= 7 ? 'WARNING' : 'VALID';

    const res = await query(
      `INSERT INTO core.driver_documents (driver_id, document_type, file_url, expires_at, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, (expires_at - CURRENT_DATE) as days_remaining`,
      [driverId, documentType, fileUrl, expiresAt, status]
    );
    return res.rows[0];
  }

  static async createVehicleDocument(vehicleId: string, documentType: string, expiresAt: string, fileUrl: string = '') {
    const statusQuery = await query(`SELECT ($1::date - CURRENT_DATE) as diff`, [expiresAt]);
    const diff = parseInt(statusQuery.rows[0]?.diff || '30', 10);
    const status = diff < 0 ? 'EXPIRED' : diff <= 7 ? 'WARNING' : 'VALID';

    const res = await query(
      `INSERT INTO core.vehicle_documents (vehicle_id, document_type, file_url, expires_at, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, (expires_at - CURRENT_DATE) as days_remaining`,
      [vehicleId, documentType, fileUrl, expiresAt, status]
    );
    return res.rows[0];
  }
}
