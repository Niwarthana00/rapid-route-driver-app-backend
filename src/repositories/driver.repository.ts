import { query } from '../config/db';

export class DriverRepository {
  static async findByEmailOrPhone(identifier: string) {
    const res = await query(
      `SELECT d.*, v.registration_number, v.model, v.seating_capacity
       FROM core.drivers d
       LEFT JOIN core.vehicles v ON d.assigned_vehicle_id = v.vehicle_id
       WHERE d.email = $1 OR d.phone = $1 OR d.nic_number = $1`,
      [identifier]
    );
    return res.rows[0] || null;
  }

  static async findById(driverId: string) {
    const res = await query(
      `SELECT d.driver_id, d.name, d.email, d.phone, d.nic_number, d.license_number, d.license_class, d.license_expiry, d.assigned_vehicle_id, d.created_at,
              v.registration_number, v.model, v.seating_capacity
       FROM core.drivers d
       LEFT JOIN core.vehicles v ON d.assigned_vehicle_id = v.vehicle_id
       WHERE d.driver_id = $1`,
      [driverId]
    );
    return res.rows[0] || null;
  }

  static async createDriver(data: {
    name: string;
    email: string;
    password_hash: string;
    nic_number: string;
    license_number: string;
    license_class?: string;
    phone: string;
    license_expiry: string;
    assigned_vehicle_id?: string;
  }) {
    const res = await query(
      `INSERT INTO core.drivers (name, email, password_hash, nic_number, license_number, license_class, phone, license_expiry, assigned_vehicle_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING driver_id, name, email, phone, nic_number, license_number, license_class, license_expiry, assigned_vehicle_id`,
      [
        data.name,
        data.email,
        data.password_hash,
        data.nic_number,
        data.license_number,
        data.license_class || 'Heavy Vehicle (Class A/B)',
        data.phone,
        data.license_expiry,
        data.assigned_vehicle_id || null,
      ]
    );
    return res.rows[0];
  }

  static async updateDriverProfile(driverId: string, data: Partial<{
    name: string;
    phone: string;
    nic_number: string;
    license_number: string;
    license_expiry: string;
  }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.phone) {
      fields.push(`phone = $${idx++}`);
      values.push(data.phone);
    }
    if (data.nic_number) {
      fields.push(`nic_number = $${idx++}`);
      values.push(data.nic_number);
    }
    if (data.license_number) {
      fields.push(`license_number = $${idx++}`);
      values.push(data.license_number);
    }
    if (data.license_expiry) {
      fields.push(`license_expiry = $${idx++}`);
      values.push(data.license_expiry);
    }

    if (fields.length === 0) {
      return this.findById(driverId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(driverId);

    const res = await query(
      `UPDATE core.drivers SET ${fields.join(', ')} WHERE driver_id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  }
}
