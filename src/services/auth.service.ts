import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { DriverRepository } from '../repositories/driver.repository';
import { PassengerRepository } from '../repositories/passenger.repository';
import { pool } from '../config/db';

export class AuthService {
  static async login(identifier: string, pass: string) {
    // 1. Fetch user account first
    const userRes = await pool.query(
      `SELECT id, email, phone, password_hash, user_type, passenger_id, driver_id, is_active 
       FROM core.user_accounts 
       WHERE email = $1 OR phone = $1`,
      [identifier]
    );
    const user = userRes.rows[0];
    if (!user) {
      throw new Error('Invalid email/phone or password');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email/phone or password');
    }

    if (user.user_type === 'PASSENGER') {
      const passengerRes = await pool.query(
        `SELECT id, full_name, phone, email, created_at 
         FROM core.passengers 
         WHERE id = $1`,
        [user.passenger_id]
      );
      const passenger = passengerRes.rows[0];
      if (!passenger) {
        throw new Error('Passenger record not found');
      }

      const tokenPayload = {
        passenger_id: passenger.id,
        email: user.email,
        phone: user.phone,
        user_type: 'PASSENGER',
      };

      const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
        expiresIn: '30d',
      });

      return {
        token,
        user_type: 'PASSENGER',
        profile: {
          passenger_id: passenger.id,
          name: passenger.full_name,
          email: passenger.email || user.email,
          phone: passenger.phone || user.phone,
          created_at: passenger.created_at,
        }
      };
    } else {
      const driver = await DriverRepository.findById(user.driver_id);
      if (!driver) {
        throw new Error('Driver record not found');
      }

      const tokenPayload = {
        driver_id: driver.driver_id,
        email: driver.email,
        phone: driver.phone,
        nic_number: driver.nic_number,
        user_type: 'DRIVER',
      };

      const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
        expiresIn: '30d',
      });

      return {
        token,
        user_type: 'DRIVER',
        profile: {
          driver_id: driver.driver_id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          nic_no: driver.nic_number,
          license_no: driver.license_number,
          license_class: driver.license_class,
          license_expiry: driver.license_expiry,
        },
        assigned_vehicle: {
          vehicle_id: driver.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e',
          registration_number: driver.registration_number || 'ND-4829',
          model: driver.model || 'Leyland Viking 2022',
          seating_capacity: driver.seating_capacity || 54,
        },
      };
    }
  }

  static async register(data: {
    user_type?: 'DRIVER' | 'PASSENGER';
    name: string;
    email: string;
    password: string;
    phone: string;
    nic_number?: string;
    license_number?: string;
    license_class?: string;
    license_expiry?: string;
    registration_number?: string;
  }) {
    const userType = data.user_type || 'DRIVER';

    const existingRes = await pool.query(
      `SELECT id FROM core.user_accounts WHERE email = $1 OR phone = $2`,
      [data.email, data.phone]
    );
    if (existingRes.rows.length > 0) {
      throw new Error('A user with this email or phone already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    if (userType === 'PASSENGER') {
      await PassengerRepository.createPassenger({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password_hash,
      });
    } else {
      await DriverRepository.createDriver({
        name: data.name,
        email: data.email,
        password_hash,
        nic_number: data.nic_number!,
        license_number: data.license_number!,
        license_class: data.license_class,
        phone: data.phone,
        license_expiry: data.license_expiry!,
      });
    }

    return this.login(data.email, data.password);
  }
}

