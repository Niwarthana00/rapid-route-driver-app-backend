import { z } from 'zod';

export const uploadDocumentSchema = z.object({
  body: z.object({
    document_type: z.string().min(1, 'Document type is required'),
    expires_at: z.string().min(1, 'Expiration date is required'),
    file_url: z.string().optional().default(''),
    category: z.enum(['DRIVER', 'VEHICLE']).optional().default('DRIVER'),
  }),
});
