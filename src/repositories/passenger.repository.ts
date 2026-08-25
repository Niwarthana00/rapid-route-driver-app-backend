import { pool } from '../config/db';

export class PassengerRepository {
  static async createPassenger(data: {
    name: string;
    email: string;
    phone: string;
    password_hash: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Insert into core.passengers first
      const passRes = await client.query(
        `INSERT INTO core.passengers (id, full_name, phone, email)
         VALUES (gen_random_uuid(), $1, $2, $3)
         RETURNING id`,
        [data.name, data.phone, data.email]
      );

      const passengerId = passRes.rows[0].id;

      // 2. Insert into core.user_accounts next, linking the passenger_id
      const userRes = await client.query(
        `INSERT INTO core.user_accounts (id, email, phone, password_hash, user_type, passenger_id)
         VALUES (gen_random_uuid(), $1, $2, $3, 'PASSENGER', $4)
         RETURNING id`,
        [data.email, data.phone, data.password_hash, passengerId]
      );

      await client.query('COMMIT');

      return {
        passenger_id: passengerId,
        user_id: userRes.rows[0].id,
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findByEmailOrPhone(identifier: string) {
    const res = await pool.query(
      `SELECT 
         p.id AS passenger_id,
         p.full_name AS name,
         u.id AS user_id,
         u.email,
         u.phone,
         u.password_hash,
         u.is_active
       FROM core.passengers p
       JOIN core.user_accounts u ON p.id = u.passenger_id
       WHERE u.email = $1 OR p.phone = $1`,
      [identifier]
    );
    return res.rows[0] || null;
  }
}
