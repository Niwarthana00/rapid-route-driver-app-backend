import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').optional(),
    phone: z.string().min(9, 'Valid phone number is required').optional(),
    nic_number: z.string().min(9, 'Valid NIC number is required').optional(),
    license_number: z.string().min(5, 'Valid license number is required').optional(),
    license_expiry: z.string().optional(),
  }),
});
