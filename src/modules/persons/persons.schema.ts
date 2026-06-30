import { z } from 'zod';

export const createPersonSchema = z.object({
  full_name: z.string().min(2).max(200),
  status: z.enum(['missing', 'found', 'searching']).default('missing'),
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'unknown']).default('unknown'),
  photo_url: z.string().url().optional().nullable(),
  description: z.string().optional(),
  last_seen_location: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  source: z.enum(['venezuelatebusca', 'redayudavenezuela', 'user_report', 'face_match']).default('user_report'),
  source_url: z.string().url().optional().nullable(),
  last_seen_date: z.string().datetime().optional().nullable(),
  contact_phone: z.string().optional(),
});

export const updatePersonSchema = createPersonSchema.partial();

export const personFilterSchema = z.object({
  status: z.enum(['missing', 'found', 'searching']).optional(),
  source: z.enum(['venezuelatebusca', 'redayudavenezuela', 'user_report', 'face_match']).optional(),
  search: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional().default(50),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
export type PersonFilterInput = z.infer<typeof personFilterSchema>;
