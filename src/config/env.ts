import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NOMINATIM_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  OSRM_BASE_URL: z.string().url().default('https://router.project-osrm.org'),
  USGS_EARTHQUAKE_URL: z.string().url().default('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'),
  NOAA_ALERTS_URL: z.string().url().default('https://api.weather.gov/alerts/active'),
  GEMINI_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
