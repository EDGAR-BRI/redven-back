import { z } from 'zod';

export const createSosSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  description: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  location_label: z.string().optional(),
  priority: z.enum(['high', 'critical']).default('critical'),
  people_count: z.number().int().positive().default(1),
  category: z.enum(['medical', 'trapped', 'flooding', 'food', 'security', 'other']).default('other'),
});

export const updateSosSchema = z.object({
  status: z.enum(['active', 'resolved', 'cancelled']).optional(),
  incident_status: z.enum(['pending', 'en_route', 'attended']).optional(),
  description: z.string().optional(),
});

export const sosFilterSchema = z.object({
  status: z.enum(['active', 'resolved', 'cancelled']).optional(),
  category: z.enum(['medical', 'trapped', 'flooding', 'food', 'security', 'other']).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional().default(10),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateSosInput = z.infer<typeof createSosSchema>;
export type UpdateSosInput = z.infer<typeof updateSosSchema>;
export type SosFilterInput = z.infer<typeof sosFilterSchema>;
