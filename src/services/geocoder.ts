import { env } from '../config/env';

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name?: string;
}

export async function geocodeLocation(locationText: string): Promise<GeocodingResult | null> {
  if (!locationText || locationText.length < 3) return null;

  try {
    const url = `${env.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(locationText + ', Venezuela')}&format=json&countrycodes=ve&limit=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RedVen/1.0 (emergency-response-app)' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json() as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!data.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch {
    return null;
  }
}
