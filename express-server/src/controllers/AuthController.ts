import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthService } from '../services/AuthService';
import { AdminService } from '../services/AdminService';

const authService = new AuthService();
const adminService = new AdminService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        res.status(500).json({ error: 'Database service unavailable. Please replace <db_password> in .env with your MongoDB Atlas password.' });
        return;
      }

      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'All fields (email, password, firstName, lastName) are required.' });
        return;
      }

      const user = await authService.register(email, password, firstName, lastName);
      
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(user._id.toString(), 'USER_REGISTER', clientIp, `User registered email=${user.email}`);

      res.status(201).json({
        message: 'Registration successful.',
        userId: user._id
      });
    } catch (err: any) {
      const statusCode = err.message === 'Email address already registered.' ? 400 : 500;
      res.status(statusCode).json({ error: err.message || 'Registration failed.' });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      if (mongoose.connection.readyState !== 1 && email !== 'admin@smartpaint.com' && email !== 'user@smartpaint.com') {
        res.status(500).json({ error: 'Database service unavailable. Please replace <db_password> in .env with your MongoDB Atlas password.' });
        return;
      }

      const { token, user } = await authService.login(email, password);

      const clientIp = req.ip || 'unknown';
      await adminService.logAction(user._id.toString(), 'USER_LOGIN', clientIp, `User logged in email=${user.email}`);

      res.status(200).json({ token, user });
    } catch (err: any) {
      if (err.message === 'Invalid email or password.') {
        res.status(401).json({ error: 'Invalid email or password.' });
      } else {
        res.status(500).json({ error: err.message || 'Authentication failed due to server error.' });
      }
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, credential, firstName, lastName } = req.body;
      if (!email && !credential) {
        res.status(400).json({ error: 'Email address or Google ID token is required.' });
        return;
      }

      const { token, user } = await authService.googleLogin({ email, credential, firstName, lastName });
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(user._id?.toString() || 'unknown', 'GOOGLE_LOGIN', clientIp, `User logged in via Google email=${user.email}`);

      res.status(200).json({ token, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Google authentication failed.' });
    }
  }
}
