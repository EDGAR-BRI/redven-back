import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.userId = user.id;
    req.userRole = user.user_metadata?.role || 'user';
    next();
  } catch {
    return res.status(401).json({ error: 'Error de autenticación' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}
