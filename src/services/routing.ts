import { env } from '../config/env';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

export async function computeRoute(pointA: LatLng, pointB: LatLng): Promise<RouteResult | null> {
  const coordStr = `${pointA.lng},${pointA.lat};${pointB.lng},${pointB.lat}`;
  const url = `${env.OSRM_BASE_URL}/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      code: string;
      routes: Array<{
        geometry: { coordinates: [number, number][] };
        distance: number;
        duration: number;
      }>;
    };

    if (data.code !== 'Ok' || !data.routes?.length) return null;

    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
    };
  } catch {
    return null;
  }
}
