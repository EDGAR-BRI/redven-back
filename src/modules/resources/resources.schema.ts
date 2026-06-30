import { z } from 'zod';

export const createResourceSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['food', 'medicine', 'shelter', 'water', 'clothing', 'logistics', 'medical_care']).default('food'),
  quantity: z.number().min(0).default(0),
  unit: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  location_label: z.string().optional(),
  status: z.enum(['available', 'low_stock', 'depleted']).default('available'),
  manager: z.string().optional(),
  contact_phone: z.string().optional(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const resourceFilterSchema = z.object({
  type: z.enum(['food', 'medicine', 'shelter', 'water', 'clothing', 'logistics', 'medical_care']).optional(),
  status: z.enum(['available', 'low_stock', 'depleted']).optional(),
  search: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional().default(50),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceFilterInput = z.infer<typeof resourceFilterSchema>;
