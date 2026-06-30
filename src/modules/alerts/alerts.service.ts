import { prisma } from '../../lib/prisma';
import { CreateAlertInput, UpdateAlertInput, AlertFilterInput } from './alerts.schema';

export async function createAlert(data: CreateAlertInput) {
  return prisma.alert.create({ data });
}

export async function listAlerts(filters: AlertFilterInput) {
  const { alert_type, severity, source, is_active, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (alert_type) where.alert_type = alert_type;
  if (severity) where.severity = severity;
  if (source) where.source = source;
  if (is_active !== undefined) where.is_active = is_active;

  const [items, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.alert.count({ where }),
  ]);

  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getAlertById(id: string) {
  return prisma.alert.findUnique({ where: { id } });
}

export async function updateAlert(id: string, data: UpdateAlertInput) {
  return prisma.alert.update({ where: { id }, data });
}

export async function deleteAlert(id: string) {
  return prisma.alert.delete({ where: { id } });
}

export async function getActiveAlertsCount() {
  return prisma.alert.count({ where: { is_active: true } });
}

export async function getRecentAlerts(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.alert.findMany({
    where: { created_at: { gte: since } },
    orderBy: { created_at: 'desc' },
  });
}
