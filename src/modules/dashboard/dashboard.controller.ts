import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export async function stats(req: Request, res: Response) {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}
