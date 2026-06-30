import { prisma } from '../../lib/prisma';
import { CreateReportInput, UpdateReportInput, ReportFilterInput } from './reports.schema';

export async function createReport(data: CreateReportInput, userId?: string) {
  return prisma.report.create({ data: { ...data, user_id: userId } });
}

export async function listReports(filters: ReportFilterInput) {
  const { category, severity, status, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (severity) where.severity = severity;
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    items,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getReportById(id: string) {
  return prisma.report.findUnique({ where: { id } });
}

export async function updateReport(id: string, data: UpdateReportInput) {
  return prisma.report.update({ where: { id }, data });
}

export async function deleteReport(id: string) {
  return prisma.report.delete({ where: { id } });
}

export async function upsertReports(reports: CreateReportInput[]) {
  let created = 0;
  let updated = 0;

  for (const r of reports) {
    if (!r.title || r.title.length < 3) continue;
    try {
      const existing = await prisma.report.findFirst({ where: { title: r.title } });
      if (existing) {
        await prisma.report.update({ where: { id: existing.id }, data: r });
        updated++;
      } else {
        await prisma.report.create({ data: r });
        created++;
      }
    } catch {
      // skip
    }
  }

  return { created, updated };
}
