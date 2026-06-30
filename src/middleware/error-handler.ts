import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({ error: 'Error en la base de datos', details: err.message });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
  });
}
