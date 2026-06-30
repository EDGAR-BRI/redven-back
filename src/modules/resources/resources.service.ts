import { prisma } from '../../lib/prisma';
import { CreateResourceInput, UpdateResourceInput, ResourceFilterInput } from './resources.schema';

export async function createResource(data: CreateResourceInput) {
  return prisma.helpResource.create({ data });
}

export async function listResources(filters: ResourceFilterInput) {
  const { type, status, search, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { location_label: { contains: search, mode: 'insensitive' } },
      { manager: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.helpResource.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.helpResource.count({ where }),
  ]);

  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getResourceById(id: string) {
  return prisma.helpResource.findUnique({ where: { id } });
}

export async function updateResource(id: string, data: UpdateResourceInput) {
  return prisma.helpResource.update({ where: { id }, data });
}

export async function deleteResource(id: string) {
  return prisma.helpResource.delete({ where: { id } });
}

export async function getResourceCount() {
  return prisma.helpResource.count({ where: { status: 'available' } });
}

export async function upsertResources(resources: CreateResourceInput[], type: string) {
  let created = 0;
  let updated = 0;

  for (const r of resources) {
    if (!r.name || r.name.length < 3) continue;
    try {
      const existing = await prisma.helpResource.findFirst({
        where: { name: r.name, type },
      });

      if (existing) {
        await prisma.helpResource.update({ where: { id: existing.id }, data: r });
        updated++;
      } else {
        await prisma.helpResource.create({ data: { ...r, type } });
        created++;
      }
    } catch {
      // skip
    }
  }

  return { created, updated };
}
