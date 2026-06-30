import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as chatService from './chat.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const result = await chatService.createMessage(req.body, req.userId);
    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await chatService.listMessages(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar mensajes' });
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const { status } = req.body;
    const message = await chatService.updateMessageStatus(req.params.id, status);
    res.json(message);
  } catch {
    res.status(500).json({ error: 'Error al actualizar mensaje' });
  }
}

export async function sectorStats(req: Request, res: Response) {
  try {
    const stats = await chatService.getSectorStats(req.params.sector);
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
