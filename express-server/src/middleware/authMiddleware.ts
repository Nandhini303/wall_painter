import { Response, NextFunction, Request } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'Admin' | 'Designer' | 'User';
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication token required.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = await authService.verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized access.' });
  }
};
