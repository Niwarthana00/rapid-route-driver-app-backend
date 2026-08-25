import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    user_type: z.enum(['DRIVER', 'PASSENGER']).optional().default('DRIVER'),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(9, 'Valid phone number is required'),
    nic_number: z.string().optional(),
    license_number: z.string().optional(),
    license_class: z.string().optional().default('D'),
    license_expiry: z.string().optional(),
    registration_number: z.string().optional(),
  }).refine((data) => {
    if (data.user_type === 'DRIVER') {
      return (
        typeof data.nic_number === 'string' && data.nic_number.length >= 9 &&
        typeof data.license_number === 'string' && data.license_number.length >= 5 &&
        typeof data.license_expiry === 'string' && data.license_expiry.length >= 1
      );
    }
    return true;
  }, {
    message: 'NIC number, license number, and license expiry are required for drivers',
    path: ['nic_number'],
  }),
});

