import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al registrar' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Credenciales inválidas' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const result = await authService.verifyOtp(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Código OTP inválido' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const result = await authService.forgotPassword(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al enviar correo' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const result = await authService.resetPassword(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al restablecer contraseña' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Usuario no encontrado' });
  }
}

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.updateMe(req.userId!, req.body);
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar perfil' });
  }
}
