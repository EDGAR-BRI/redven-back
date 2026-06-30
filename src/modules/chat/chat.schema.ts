import { z } from 'zod';

export const createChatMessageSchema = z.object({
  sector: z.enum(['urgencias-sos', 'ayuda-humanitaria', 'asistencia-medica', 'general']).default('general'),
  content: z.string().min(1).max(2000),
  author_name: z.string().optional(),
  message_type: z.enum(['message', 'alert', 'system']).default('message'),
  tag: z.enum(['SOLICITO', 'OFREZCO', 'UBICACION', 'EN GESTION', 'ENTREGADO', 'none']).default('none'),
  item_name: z.string().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const chatFilterSchema = z.object({
  sector: z.enum(['urgencias-sos', 'ayuda-humanitaria', 'asistencia-medica', 'general']).optional(),
  tag: z.enum(['SOLICITO', 'OFREZCO', 'UBICACION', 'EN GESTION', 'ENTREGADO', 'none']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>;
export type ChatFilterInput = z.infer<typeof chatFilterSchema>;
