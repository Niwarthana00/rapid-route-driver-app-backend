import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { DriverRepository } from '../repositories/driver.repository';

export class AuthService {
  static async login(identifier: string, pass: string) {
    const driver = await DriverRepository.findByEmailOrPhone(identifier);
    if (!driver) {
      throw new Error('Invalid email/phone or password');
    }

    const isMatch = await bcrypt.compare(pass, driver.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email/phone or password');
    }

    const tokenPayload = {
      driver_id: driver.driver_id,
      email: driver.email,
      phone: driver.phone,
      nic_number: driver.nic_number,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: '30d',
    });

    return {
      token,
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
        vehicle_id: driver.assigned_vehicle_id || 'veh-138-01',
        registration_number: driver.registration_number || 'ND-4829',
        model: driver.model || 'Leyland Viking 2022',
        seating_capacity: driver.seating_capacity || 54,
      },
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    nic_number: string;
    license_number: string;
    license_class?: string;
    license_expiry: string;
    registration_number?: string;
  }) {
    const existing = await DriverRepository.findByEmailOrPhone(data.email);
    if (existing) {
      throw new Error('A driver with this email or phone already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(data.password, salt);

    const newDriver = await DriverRepository.createDriver({
      name: data.name,
      email: data.email,
      password_hash,
      nic_number: data.nic_number,
      license_number: data.license_number,
      license_class: data.license_class,
      phone: data.phone,
      license_expiry: data.license_expiry,
    });

    return this.login(data.email, data.password);
  }
}
