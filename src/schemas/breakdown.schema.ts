import { z } from 'zod';

export const createBreakdownSchema = z.object({
  body: z.object({
    trip_id: z.string().optional(),
    reason: z.string().min(1, 'Reason is required'), // Engine issue, Tyre puncture, Accident, Other
    location: z.string().min(1, 'Location is required'),
    notes: z.string().optional().default(''),
  }),
});
