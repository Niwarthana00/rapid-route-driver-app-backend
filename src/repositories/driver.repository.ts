import { query, pool } from '../config/db';

export class DriverRepository {
  static async findByEmailOrPhone(identifier: string) {
    const res = await query(
      `SELECT 
         d.id AS driver_id, 
         d.full_name AS name, 
         u.email, 
         u.password_hash, 
         d.phone, 
         d.nic_number, 
         d.license_number, 
         d.license_class, 
         d.license_expiry, 
         a.vehicle_id AS assigned_vehicle_id, 
         d.created_at,
         v.registration_number, 
         v.model, 
         v.total_seats AS seating_capacity
       FROM core.drivers d
       JOIN core.user_accounts u ON d.phone = u.phone
       LEFT JOIN core.driver_assignments a ON d.id = a.driver_id AND a.is_current = true
       LEFT JOIN core.vehicles v ON a.vehicle_id = v.id
       WHERE u.email = $1 OR d.phone = $1 OR d.nic_number = $1`,
      [identifier]
    );
    return res.rows[0] || null;
  }

  static async findById(driverId: string) {
    const res = await query(
      `SELECT 
         d.id AS driver_id, 
         d.full_name AS name, 
         u.email, 
         u.password_hash, 
         d.phone, 
         d.nic_number, 
         d.license_number, 
         d.license_class, 
         d.license_expiry, 
         a.vehicle_id AS assigned_vehicle_id, 
         d.created_at,
         v.registration_number, 
         v.model, 
         v.total_seats AS seating_capacity
       FROM core.drivers d
       JOIN core.user_accounts u ON d.phone = u.phone
       LEFT JOIN core.driver_assignments a ON d.id = a.driver_id AND a.is_current = true
       LEFT JOIN core.vehicles v ON a.vehicle_id = v.id
       WHERE d.id = $1`,
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const licenseClass = (data.license_class || 'D').substring(0, 20);

      // 1. Insert into core.drivers first to get the id
      const driverRes = await client.query(
        `INSERT INTO core.drivers (id, nic_number, full_name, license_number, license_class, phone, license_expiry)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
         RETURNING id, full_name, nic_number, license_number, license_class, phone, license_expiry`,
        [
          data.nic_number,
          data.name,
          data.license_number,
          licenseClass,
          data.phone,
          data.license_expiry
        ]
      );

      const driver = driverRes.rows[0];

      // 2. Insert into core.user_accounts next, linking driver_id
      await client.query(
        `INSERT INTO core.user_accounts (id, email, phone, password_hash, user_type, driver_id)
         VALUES (gen_random_uuid(), $1, $2, $3, 'DRIVER', $4)`,
        [data.email, data.phone, data.password_hash, driver.id]
      );

      if (data.assigned_vehicle_id) {
        await client.query(
          `INSERT INTO core.driver_assignments (driver_id, vehicle_id, assigned_from, is_current)
           VALUES ($1, $2, CURRENT_DATE, true)`,
          [driver.id, data.assigned_vehicle_id]
        );
      }

      await client.query('COMMIT');

      return {
        driver_id: driver.id,
        name: driver.full_name,
        email: data.email,
        phone: driver.phone,
        nic_number: driver.nic_number,
        license_number: driver.license_number,
        license_class: driver.license_class,
        license_expiry: driver.license_expiry,
        assigned_vehicle_id: data.assigned_vehicle_id || null
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
      fields.push(`full_name = $${idx++}`);
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
      `UPDATE core.drivers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  }
}
