import { prisma } from '../../lib/prisma';
import { CreateSosInput, UpdateSosInput, SosFilterInput } from './sos.schema';

export async function createSOS(data: CreateSosInput, userId?: string) {
  return prisma.sOS.create({
    data: { ...data, user_id: userId },
    include: { user: { select: { id: true, full_name: true, email: true } } },
  });
}

export async function listSOS(filters: SosFilterInput) {
  const { status, category, lat, lng, radius, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.sOS.findMany({
      where,
      include: { user: { select: { id: true, full_name: true, email: true } } },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.sOS.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getSOSById(id: string) {
  return prisma.sOS.findUnique({
    where: { id },
    include: { user: { select: { id: true, full_name: true, email: true } } },
  });
}

export async function updateSOS(id: string, data: UpdateSosInput) {
  return prisma.sOS.update({
    where: { id },
    data,
    include: { user: { select: { id: true, full_name: true, email: true } } },
  });
}

export async function deleteSOS(id: string) {
  return prisma.sOS.delete({ where: { id } });
}

export async function getActiveSOSCount() {
  return prisma.sOS.count({ where: { status: 'active' } });
}
