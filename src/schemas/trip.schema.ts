import { z } from 'zod';

export const startTripSchema = z.object({
  body: z.object({
    route_id: z.string().optional().default('route-138'),
    vehicle_id: z.string().optional(),
  }),
});

export const updateHaltSchema = z.object({
  params: z.object({
    haltId: z.string().min(1, 'Halt ID is required'),
  }),
  body: z.object({
    name: z.string().optional(),
    sequence_no: z.number().int().positive().optional(),
  }),
});

export const completeHaltSchema = z.object({
  body: z.object({
    trip_id: z.string().min(1, 'Trip ID is required'),
    halt_id: z.string().min(1, 'Halt ID is required'),
    sequence_no: z.number().int().positive(),
    boarded_passengers: z.number().int().nonnegative().optional().default(0),
  }),
});

export const finishTripSchema = z.object({
  body: z.object({
    trip_id: z.string().min(1, 'Trip ID is required'),
  }),
});

export const pingLocationSchema = z.object({
  body: z.object({
    trip_id: z.string().min(1, 'Trip ID is required'),
    latitude: z.number(),
    longitude: z.number(),
    speed: z.number().optional().default(0),
  }),
});
