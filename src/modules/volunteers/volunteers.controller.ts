import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as volunteersService from './volunteers.service';

export async function create(req: AuthRequest, res: Response) {
  try {
    const volunteer = await volunteersService.createVolunteer(req.body, req.userId);
    res.status(201).json(volunteer);
  } catch {
    res.status(500).json({ error: 'Error al crear voluntario' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await volunteersService.listVolunteers(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar voluntarios' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const volunteer = await volunteersService.getVolunteerById(req.params.id as string);
    if (!volunteer) return res.status(404).json({ error: 'Voluntario no encontrado' });
    res.json(volunteer);
  } catch {
    res.status(500).json({ error: 'Error al obtener voluntario' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const volunteer = await volunteersService.updateVolunteer(req.params.id as string, req.body);
    res.json(volunteer);
  } catch {
    res.status(500).json({ error: 'Error al actualizar voluntario' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await volunteersService.deleteVolunteer(req.params.id as string);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar voluntario' });
  }
}
