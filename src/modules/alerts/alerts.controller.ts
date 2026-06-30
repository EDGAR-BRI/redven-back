import { Request, Response } from 'express';
import * as alertsService from './alerts.service';

export async function create(req: Request, res: Response) {
  try {
    const alert = await alertsService.createAlert(req.body);
    res.status(201).json(alert);
  } catch {
    res.status(500).json({ error: 'Error al crear alerta' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await alertsService.listAlerts(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar alertas' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const alert = await alertsService.getAlertById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alerta no encontrada' });
    res.json(alert);
  } catch {
    res.status(500).json({ error: 'Error al obtener alerta' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const alert = await alertsService.updateAlert(req.params.id, req.body);
    res.json(alert);
  } catch {
    res.status(500).json({ error: 'Error al actualizar alerta' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await alertsService.deleteAlert(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar alerta' });
  }
}
