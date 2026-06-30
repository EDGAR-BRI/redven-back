import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as reportsService from './reports.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const report = await reportsService.createReport(req.body, req.userId);
    res.status(201).json(report);
  } catch {
    res.status(500).json({ error: 'Error al crear reporte' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await reportsService.listReports(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar reportes' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const report = await reportsService.getReportById(req.params.id as string);
    if (!report) return res.status(404).json({ error: 'Reporte no encontrado' });
    res.json(report);
  } catch {
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const report = await reportsService.updateReport(req.params.id as string, req.body);
    res.json(report);
  } catch {
    res.status(500).json({ error: 'Error al actualizar reporte' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await reportsService.deleteReport(req.params.id as string);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar reporte' });
  }
}
