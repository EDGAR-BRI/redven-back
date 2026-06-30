import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as sosService from './sos.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const sos = await sosService.createSOS(req.body, req.userId);
    res.status(201).json(sos);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear SOS' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await sosService.listSOS(req.query as any);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar SOS' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const sos = await sosService.getSOSById(req.params.id);
    if (!sos) return res.status(404).json({ error: 'SOS no encontrado' });
    res.json(sos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener SOS' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const sos = await sosService.updateSOS(req.params.id, req.body);
    res.json(sos);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar SOS' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await sosService.deleteSOS(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar SOS' });
  }
}
