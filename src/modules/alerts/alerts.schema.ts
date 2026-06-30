import { z } from 'zod';

export const createAlertSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  source: z.enum(['usgs', 'noaa', 'internal', 'manual']).default('manual'),
  alert_type: z.enum(['earthquake', 'weather', 'flood', 'landslide', 'tsunami', 'security', 'other']).default('other'),
  severity: z.enum(['advisory', 'watch', 'warning', 'critical']).default('watch'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  region: z.string().optional(),
  event_time: z.string().datetime().optional(),
});

export const updateAlertSchema = z.object({
  is_active: z.boolean().optional(),
  severity: z.enum(['advisory', 'watch', 'warning', 'critical']).optional(),
  description: z.string().optional(),
});

export const alertFilterSchema = z.object({
  alert_type: z.enum(['earthquake', 'weather', 'flood', 'landslide', 'tsunami', 'security', 'other']).optional(),
  severity: z.enum(['advisory', 'watch', 'warning', 'critical']).optional(),
  source: z.enum(['usgs', 'noaa', 'internal', 'manual']).optional(),
  is_active: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type AlertFilterInput = z.infer<typeof alertFilterSchema>;
