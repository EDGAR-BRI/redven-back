import { Request, Response } from 'express';
import * as personsService from './persons.service';

export async function create(req: Request, res: Response) {
  try {
    const person = await personsService.createPerson(req.body);
    res.status(201).json(person);
  } catch {
    res.status(500).json({ error: 'Error al crear persona' });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const result = await personsService.listPersons(req.query as any);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Error al listar personas' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const person = await personsService.getPersonById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Persona no encontrada' });
    res.json(person);
  } catch {
    res.status(500).json({ error: 'Error al obtener persona' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const person = await personsService.updatePerson(req.params.id, req.body);
    res.json(person);
  } catch {
    res.status(500).json({ error: 'Error al actualizar persona' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await personsService.deletePerson(req.params.id);
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Error al eliminar persona' });
  }
}
