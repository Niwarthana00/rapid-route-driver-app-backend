import { z } from 'zod';

export const logCostSchema = z.object({
  body: z.object({
    maintenance_type: z.enum(['FUEL', 'REPAIR']),
    amount: z.number().positive('Amount must be greater than zero'),
    liters: z.number().nonnegative().optional().default(0),
    description: z.string().optional().default(''),
  }),
});
