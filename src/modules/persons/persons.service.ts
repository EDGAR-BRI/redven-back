import { prisma } from '../../lib/prisma';
import { CreatePersonInput, UpdatePersonInput, PersonFilterInput } from './persons.schema';

export async function createPerson(data: CreatePersonInput) {
  return prisma.person.create({ data });
}

export async function listPersons(filters: PersonFilterInput) {
  const { status, source, search, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { last_seen_location: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.person.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.person.count({ where }),
  ]);

  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getPersonById(id: string) {
  return prisma.person.findUnique({ where: { id } });
}

export async function updatePerson(id: string, data: UpdatePersonInput) {
  return prisma.person.update({ where: { id }, data });
}

export async function deletePerson(id: string) {
  return prisma.person.delete({ where: { id } });
}

export async function getMissingCount() {
  return prisma.person.count({ where: { status: 'missing' } });
}

export async function upsertPersons(persons: CreatePersonInput[], source: string) {
  let created = 0;
  let updated = 0;

  for (const p of persons) {
    if (!p.full_name || p.full_name.length < 3) continue;
    try {
      const existing = await prisma.person.findFirst({
        where: { full_name: p.full_name, source },
      });

      if (existing) {
        await prisma.person.update({ where: { id: existing.id }, data: p });
        updated++;
      } else {
        await prisma.person.create({ data: { ...p, source } });
        created++;
      }
    } catch {
      // skip individual failures
    }
  }

  return { created, updated };
}
