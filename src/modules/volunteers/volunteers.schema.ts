import { z } from 'zod';

export const createVolunteerSchema = z.object({
  full_name: z.string().min(2).max(200),
  expertise: z.enum(['medical', 'rescue', 'logistics', 'communications', 'engineering', 'first_aid', 'coordinator', 'other']).default('first_aid'),
  zone: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  availability: z.enum(['available', 'on_mission', 'offline']).default('available'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  certifications: z.string().optional(),
});

export const updateVolunteerSchema = createVolunteerSchema.partial();

export const volunteerFilterSchema = z.object({
  expertise: z.enum(['medical', 'rescue', 'logistics', 'communications', 'engineering', 'first_aid', 'coordinator', 'other']).optional(),
  availability: z.enum(['available', 'on_mission', 'offline']).optional(),
  zone: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;
export type VolunteerFilterInput = z.infer<typeof volunteerFilterSchema>;
