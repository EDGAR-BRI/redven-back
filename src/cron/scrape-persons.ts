import cron from 'node-cron';
import { scrapeVenezuelaTeBusca, scrapeRedAyudaVenezuela } from '../services/scraper';
import { geocodeLocation } from '../services/geocoder';
import { prisma } from '../lib/prisma';
import { createPersonSchema } from '../modules/persons/persons.schema';
import { createResourceSchema } from '../modules/resources/resources.schema';
import { createReportSchema } from '../modules/reports/reports.schema';
import type { z } from 'zod';

async function upsertPersonsFromScrape(persons: Awaited<ReturnType<typeof scrapeVenezuelaTeBusca>>, source: string) {
  let created = 0;
  let updated = 0;

  for (const p of persons) {
    if (!p.full_name || p.full_name.length < 3) continue;

    try {
      const validated = createPersonSchema.safeParse({
        ...p,
        source,
      });

      if (!validated.success) continue;

      const existing = await prisma.person.findFirst({
        where: { full_name: p.full_name, source },
      });

      if (existing) {
        await prisma.person.update({ where: { id: existing.id }, data: validated.data });
        updated++;
      } else {
        const coords = p.last_seen_location ? await geocodeLocation(p.last_seen_location) : null;
        await prisma.person.create({
          data: {
            ...validated.data,
            lat: coords?.lat,
            lng: coords?.lng,
          },
        });
        created++;
      }
    } catch {
      // skip
    }
  }

  return { created, updated };
}

async function upsertResourcesFromScrape(
  resources: { name: string; contact_phone?: string; location_label?: string }[],
  type: string,
) {
  let created = 0;
  let updated = 0;

  for (const r of resources) {
    if (!r.name || r.name.length < 3) continue;

    try {
      const validated = createResourceSchema.safeParse({ ...r, type });
      if (!validated.success) continue;

      const existing = await prisma.helpResource.findFirst({
        where: { name: r.name, type },
      });

      if (existing) {
        await prisma.helpResource.update({ where: { id: existing.id }, data: validated.data });
        updated++;
      } else {
        const coords = r.location_label ? await geocodeLocation(r.location_label) : null;
        await prisma.helpResource.create({
          data: { ...validated.data, lat: coords?.lat, lng: coords?.lng },
        });
        created++;
      }
    } catch {
      // skip
    }
  }

  return { created, updated };
}

export function startScrapingCron() {
  // Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[CRON] Starting scraping...');

    try {
      const vtbPersons = await scrapeVenezuelaTeBusca();
      console.log(`[CRAPED] VenezuelaTeBusca: ${vtbPersons.length} persons`);

      const result = await upsertPersonsFromScrape(vtbPersons, 'venezuelatebusca');
      console.log(`[UPSERT] VenezuelaTeBusca: created=${result.created}, updated=${result.updated}`);
    } catch (error) {
      console.error('[CRON] VenezuelaTeBusca error:', (error as Error).message);
    }

    try {
      const rayData = await scrapeRedAyudaVenezuela();
      console.log(`[SCRAPED] RedAyuda: ${rayData.persons.length} persons, ${rayData.shelters.length} shelters, ${rayData.hospitals.length} hospitals, ${rayData.damages.length} damages`);

      const personsResult = await upsertPersonsFromScrape(rayData.persons, 'redayudavenezuela');
      console.log(`[UPSERT] RedAyuda persons: created=${personsResult.created}, updated=${personsResult.updated}`);

      await upsertResourcesFromScrape(rayData.shelters, 'shelter');
      await upsertResourcesFromScrape(rayData.hospitals, 'medical_care');

      for (const d of rayData.damages) {
        const validated = createReportSchema.safeParse(d);
        if (!validated.success) continue;

        const existing = await prisma.report.findFirst({ where: { title: d.title } });
        if (existing) {
          await prisma.report.update({ where: { id: existing.id }, data: validated.data });
        } else {
          const coords = d.location_label ? await geocodeLocation(d.location_label) : null;
          await prisma.report.create({
            data: { ...validated.data, lat: coords?.lat, lng: coords?.lng },
          });
        }
      }
    } catch (error) {
      console.error('[CRON] RedAyuda error:', (error as Error).message);
    }

    console.log('[CRON] Scraping complete');
  });

  console.log('[CRON] Scraping job scheduled (every 30 minutes)');
}
