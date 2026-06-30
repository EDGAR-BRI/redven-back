import { z } from 'zod';

export const createReportSchema = z.object({
  title: z.string().min(2).max(300),
  description: z.string().optional(),
  category: z.enum(['infrastructure', 'road', 'power', 'water', 'communication', 'building', 'other']).default('infrastructure'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  photo_url: z.string().url().optional().nullable(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  location_label: z.string().optional(),
  reporter_name: z.string().optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'verified', 'resolved']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().optional(),
});

export const reportFilterSchema = z.object({
  category: z.enum(['infrastructure', 'road', 'power', 'water', 'communication', 'building', 'other']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['pending', 'verified', 'resolved']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
