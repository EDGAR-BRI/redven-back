import { env } from '../config/env';
import { prisma } from '../lib/prisma';

const VENEZUELA_BBOX = { minLat: 0.5, maxLat: 12.5, minLng: -73.5, maxLng: -59.5 };

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isInVenezuela(lat: number, lng: number): boolean {
  return lat >= VENEZUELA_BBOX.minLat && lat <= VENEZUELA_BBOX.maxLat &&
    lng >= VENEZUELA_BBOX.minLng && lng <= VENEZUELA_BBOX.maxLng;
}

function classifyMagnitude(mag: number): { severity: string; level: number } {
  if (mag >= 6) return { severity: 'critical', level: 3 };
  if (mag >= 4.5) return { severity: 'warning', level: 2 };
  return { severity: 'advisory', level: 1 };
}

export interface SeismicEvent {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  severity: string;
  level: number;
  mag: number;
  distance?: number;
  place: string;
  event_time: Date;
  source: string;
}

export async function scanUSGS(): Promise<SeismicEvent[]> {
  try {
    const res = await fetch(env.USGS_EARTHQUAKE_URL, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      features: Array<{
        id: string;
        geometry: { coordinates: [number, number, number] };
        properties: {
          mag: number;
          place: string;
          time: number;
          title: string;
          description: string;
        };
      }>;
    };

    const venezuelaQuakes = data.features.filter((f) => {
      const [lng, lat] = f.geometry.coordinates;
      return isInVenezuela(lat, lng) && f.properties.mag >= 2.5;
    });

    const events: SeismicEvent[] = [];

    for (const feature of venezuelaQuakes) {
      const [lng, lat, depth] = feature.geometry.coordinates;
      const { severity, level } = classifyMagnitude(feature.properties.mag);

      await prisma.alert.create({
        data: {
          title: feature.properties.title || `Sismo M${feature.properties.mag}`,
          description: `Magnitud: ${feature.properties.mag}. Profundidad: ${depth}km. Lugar: ${feature.properties.place}`,
          source: 'usgs',
          alert_type: 'earthquake',
          severity,
          lat,
          lng,
          region: feature.properties.place,
          event_time: new Date(feature.properties.time),
        },
      });

      events.push({
        id: feature.id,
        title: feature.properties.title || `Sismo M${feature.properties.mag}`,
        description: feature.properties.description || '',
        lat,
        lng,
        severity,
        level,
        mag: feature.properties.mag,
        place: feature.properties.place,
        event_time: new Date(feature.properties.time),
        source: 'usgs',
      });
    }

    return events;
  } catch (error) {
    console.error('[SEISMIC] USGS scan error:', (error as Error).message);
    return [];
  }
}

export async function scanNOAA(lat: number, lng: number): Promise<SeismicEvent[]> {
  try {
    const url = `${env.NOAA_ALERTS_URL}?point=${lat},${lng}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/geo+json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      features: Array<{
        id: string;
        properties: {
          event: string;
          severity: string;
          headline: string;
          description: string;
          areaDesc: string;
        };
      }>;
    };

    const events: SeismicEvent[] = [];

    for (const feature of data.features) {
      const severityMap: Record<string, { severity: string; level: number }> = {
        Extreme: { severity: 'critical', level: 3 },
        Severe: { severity: 'warning', level: 2 },
        Moderate: { severity: 'watch', level: 1 },
        Minor: { severity: 'advisory', level: 1 },
        Unknown: { severity: 'advisory', level: 1 },
      };

      const { severity, level } = severityMap[feature.properties.severity] || { severity: 'advisory', level: 1 };

      events.push({
        id: feature.id,
        title: feature.properties.event,
        description: feature.properties.headline || feature.properties.description,
        lat,
        lng,
        severity,
        level,
        mag: 0,
        place: feature.properties.areaDesc,
        event_time: new Date(),
        source: 'noaa',
      });
    }

    return events;
  } catch (error) {
    console.error('[SEISMIC] NOAA scan error:', (error as Error).message);
    return [];
  }
}
