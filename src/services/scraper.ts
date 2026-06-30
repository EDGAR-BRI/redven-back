import * as cheerio from 'cheerio';

export interface ScrapedPerson {
  full_name: string;
  status: 'missing' | 'found';
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  last_seen_location?: string;
  photo_url?: string;
  source_url: string;
}

export async function scrapeVenezuelaTeBusca(): Promise<ScrapedPerson[]> {
  try {
    const res = await fetch('https://venezuelatebusca.com/', {
      headers: { 'User-Agent': 'RedVen/1.0 (emergency-response-app)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const persons: ScrapedPerson[] = [];

    $('table tbody tr, .card, .persona-item, article').each((_, el) => {
      const nameEl = $(el).find('h2, h3, h4, h5, .name, .nombre, td:first-child').first();
      const name = nameEl.text().trim();

      if (!name || name.length < 3) return;

      const statusText = $(el).text();
      const status: 'missing' | 'found' =
        statusText.includes('Localizada') || statusText.includes('Localizado') || statusText.includes('Encontrad')
          ? 'found'
          : 'missing';

      const imgEl = $(el).find('img').first();
      const photo_url = imgEl.attr('src') || imgEl.attr('data-src') || undefined;

      const locationEl = $(el).find('.location, .ubicacion, .text-muted, td:nth-child(3)').first();
      const last_seen_location = locationEl.text().trim() || undefined;

      const ageMatch = statusText.match(/(\d+)\s*(años|anos|years)/i);
      const age = ageMatch ? parseInt(ageMatch[1]) : undefined;

      const genderMatch = statusText.match(/\b(masculino|femenino|male|female|hombre|mujer)\b/i);
      let gender: 'male' | 'female' | 'unknown' = 'unknown';
      if (genderMatch) {
        const g = genderMatch[1].toLowerCase();
        gender = ['masculino', 'male', 'hombre'].includes(g) ? 'male' : 'female';
      }

      persons.push({
        full_name: name,
        status,
        age,
        gender,
        last_seen_location,
        photo_url,
        source_url: 'https://venezuelatebusca.com/',
      });
    });

    return persons;
  } catch (error) {
    console.error('[SCRAPER] VenezuelaTeBusca error:', (error as Error).message);
    return [];
  }
}

export async function scrapeRedAyudaVenezuela(): Promise<{
  persons: ScrapedPerson[];
  shelters: { name: string; contact_phone?: string; location_label?: string }[];
  hospitals: { name: string; contact_phone?: string; location_label?: string }[];
  damages: { title: string; category: 'building' | 'road'; severity: 'high' | 'critical'; location_label?: string }[];
}> {
  try {
    const res = await fetch('https://redayudavenezuela.com/', {
      headers: { 'User-Agent': 'RedVen/1.0 (emergency-response-app)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    const persons: ScrapedPerson[] = [];
    const shelters: { name: string; contact_phone?: string; location_label?: string }[] = [];
    const hospitals: { name: string; contact_phone?: string; location_label?: string }[] = [];
    const damages: { title: string; category: 'building' | 'road'; severity: 'high' | 'critical'; location_label?: string }[] = [];

    // Extract reports/posts from the site
    $('article, .post, .report, .card, entry-content').each((_, el) => {
      const text = $(el).text().toLowerCase();

      // Classify content type
      if (text.includes('desaparecid') || text.includes('missing') || text.includes('busca')) {
        const nameEl = $(el).find('h2, h3, h4, strong, b').first();
        const name = nameEl.text().trim();
        if (name && name.length >= 3) {
          persons.push({
            full_name: name,
            status: 'missing',
            source_url: 'https://redayudavenezuela.com/',
          });
        }
      }

      if (text.includes('refugio') || text.includes('albergue') || text.includes('acopio')) {
        const nameEl = $(el).find('h2, h3, h4, strong').first();
        const name = nameEl.text().trim();
        const phone = $(el).find('a[href^="tel"]').text().trim() || undefined;
        const location = $(el).find('.location, .ubicacion').text().trim() || undefined;
        if (name) shelters.push({ name, contact_phone: phone, location_label: location });
      }

      if (text.includes('hospital') || text.includes('centro de salud') || text.includes('medico')) {
        const nameEl = $(el).find('h2, h3, h4, strong').first();
        const name = nameEl.text().trim();
        const phone = $(el).find('a[href^="tel"]').text().trim() || undefined;
        if (name) hospitals.push({ name, contact_phone: phone });
      }

      if (text.includes('derrumbe') || text.includes('colaps') || text.includes('bloquead')) {
        const titleEl = $(el).find('h2, h3, h4, strong').first();
        const title = titleEl.text().trim();
        if (title) {
          const isRoad = text.includes('calle') || text.includes('avenida') || text.includes('bloquead');
          damages.push({
            title,
            category: isRoad ? 'road' : 'building',
            severity: text.includes('critico') || text.includes('grave') ? 'critical' : 'high',
          });
        }
      }
    });

    return { persons, shelters, hospitals, damages };
  } catch (error) {
    console.error('[SCRAPER] RedAyudaVenezuela error:', (error as Error).message);
    return { persons: [], shelters: [], hospitals: [], damages: [] };
  }
}
