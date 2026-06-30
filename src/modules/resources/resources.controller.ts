import { Request, Response } from 'express';
import * as resourcesService from './resources.service';

export async function create(req: Request, res: Response) {
  try {
    const resource = await resourcesService.createResource(req.body);
    res.status(201).json(resource);
  } catch {
    res.status(500).json({ error: 'Error al crear recurso' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await resourcesService.listResources(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar recursos' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const resource = await resourcesService.getResourceById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Recurso no encontrado' });
    res.json(resource);
  } catch {
    res.status(500).json({ error: 'Error al obtener recurso' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const resource = await resourcesService.updateResource(req.params.id, req.body);
    res.json(resource);
  } catch {
    res.status(500).json({ error: 'Error al actualizar recurso' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await resourcesService.deleteResource(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar recurso' });
  }
}
