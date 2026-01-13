import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

export const isProfessional = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'PROFESSIONAL') {
    return res.status(403).json({ error: 'Accès réservé aux professionnels' });
  }
  next();
};
