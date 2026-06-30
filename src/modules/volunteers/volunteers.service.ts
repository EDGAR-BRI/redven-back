import { prisma } from '../../lib/prisma';
import { CreateVolunteerInput, UpdateVolunteerInput, VolunteerFilterInput } from './volunteers.schema';

export async function createVolunteer(data: CreateVolunteerInput, userId?: string) {
  return prisma.volunteer.create({ data: { ...data, user_id: userId } });
}

export async function listVolunteers(filters: VolunteerFilterInput) {
  const { expertise, availability, zone, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (expertise) where.expertise = expertise;
  if (availability) where.availability = availability;
  if (zone) where.zone = zone;

  const [items, total] = await Promise.all([
    prisma.volunteer.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.volunteer.count({ where }),
  ]);

  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getVolunteerById(id: string) {
  return prisma.volunteer.findUnique({ where: { id } });
}

export async function updateVolunteer(id: string, data: UpdateVolunteerInput) {
  return prisma.volunteer.update({ where: { id }, data });
}

export async function deleteVolunteer(id: string) {
  return prisma.volunteer.delete({ where: { id } });
}

export async function getVolunteerCount() {
  return prisma.volunteer.count();
}

export async function getAvailableVolunteerCount() {
  return prisma.volunteer.count({ where: { availability: 'available' } });
}
