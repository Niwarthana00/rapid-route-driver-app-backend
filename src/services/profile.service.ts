import { DriverRepository } from '../repositories/driver.repository';

export class ProfileService {
  static async getProfile(driverId: string) {
    const driver = await DriverRepository.findById(driverId);
    if (!driver) {
      throw new Error('Driver profile not found');
    }
    return {
      driver_id: driver.driver_id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      nic_number: driver.nic_number,
      license_number: driver.license_number,
      license_class: driver.license_class,
      license_expiry: driver.license_expiry,
      assigned_vehicle: {
        vehicle_id: driver.assigned_vehicle_id || '8ff56887-33fa-411c-bcca-b3f95b5f089e',
        registration_number: driver.registration_number || 'ND-4829',
        model: driver.model || 'Leyland Viking 2022',
        seating_capacity: driver.seating_capacity || 54,
      },
      created_at: driver.created_at,
    };
  }

  static async updateProfile(driverId: string, data: any) {
    const updated = await DriverRepository.updateDriverProfile(driverId, data);
    return this.getProfile(driverId);
  }
}
