import { prisma } from '../../lib/prisma';
import { CreateChatMessageInput, ChatFilterInput } from './chat.schema';
import { moderateMessage } from './chat.moderation';

export async function createMessage(data: CreateChatMessageInput, userId?: string, userName?: string) {
  const moderation = moderateMessage(data.content);
  if (moderation.blocked) {
    return { error: moderation.reason };
  }

  return prisma.chatMessage.create({
    data: {
      ...data,
      author_name: userName || data.author_name || 'Anónimo',
      user_id: userId,
    },
  });
}

export async function listMessages(filters: ChatFilterInput) {
  const { sector, tag, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (sector) where.sector = sector;
  if (tag) where.tag = tag;

  const [items, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.chatMessage.count({ where }),
  ]);

  return {
    items: items.reverse(),
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  };
}

export async function getMessageById(id: string) {
  return prisma.chatMessage.findUnique({ where: { id } });
}

export async function updateMessageStatus(id: string, status: 'pending' | 'in_management' | 'delivered') {
  return prisma.chatMessage.update({ where: { id }, data: { status } });
}

export async function getSectorStats(sector: string) {
  const [total, solicito, ofrezco, enGestion] = await Promise.all([
    prisma.chatMessage.count({ where: { sector, message_type: 'message' } }),
    prisma.chatMessage.count({ where: { sector, tag: 'SOLICITO', status: { not: 'delivered' } } }),
    prisma.chatMessage.count({ where: { sector, tag: 'OFREZCO', status: { not: 'delivered' } } }),
    prisma.chatMessage.count({ where: { sector, tag: 'EN GESTION' } }),
  ]);

  return { total, solicito, ofrezco, enGestion };
}
