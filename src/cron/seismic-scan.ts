import cron from 'node-cron';
import { scanUSGS, scanNOAA } from '../services/seismic-monitor';

const SCAN_INTERVAL = '*/1 * * * *'; // Every minute

export function startSeismicCron() {
  cron.schedule(SCAN_INTERVAL, async () => {
    console.log('[CRON] Starting seismic scan...');

    try {
      const events = await scanUSGS();
      if (events.length > 0) {
        console.log(`[SEISMIC] USGS: ${events.length} events detected in Venezuela`);
      }
    } catch (error) {
      console.error('[CRON] USGS error:', (error as Error).message);
    }

    try {
      // Scan for a central point in Venezuela (Caracas)
      const events = await scanNOAA(10.4806, -66.9036);
      if (events.length > 0) {
        console.log(`[SEISMIC] NOAA: ${events.length} weather alerts`);
      }
    } catch (error) {
      console.error('[CRON] NOAA error:', (error as Error).message);
    }
  });

  console.log('[CRON] Seismic monitor scheduled (every 60 seconds)');
}
