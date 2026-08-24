import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(9, 'Valid phone number is required'),
    nic_number: z.string().min(9, 'Valid NIC number is required'),
    license_number: z.string().min(5, 'Valid license number is required'),
    license_class: z.string().optional().default('Heavy Vehicle (Class A/B)'),
    license_expiry: z.string().min(1, 'License expiry date is required'),
    registration_number: z.string().optional(),
  }),
});
