import { Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const adminService = new AdminService();

export class AdminController {
  async inviteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, role, workspace } = req.body;
      if (!email || !role) {
        res.status(400).json({ error: 'Email and role are required.' });
        return;
      }
      const newUser = await adminService.inviteUser(email, role, workspace);
      
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(req.user?.userId, 'USER_INVITED', clientIp, `Invited user ${email} as ${role}`);

      // Emit socket event
      const { getIo } = require('../sockets/socketHandler');
      const io = getIo();
      if (io) {
        io.emit('admin:users:updated');
      }

      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const users = await adminService.listUsers(limit, skip);
      res.status(200).json(users);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!id || !role) {
        res.status(400).json({ error: 'User ID and role are required.' });
        return;
      }

      const updated = await adminService.updateUserRole(id, role);
      
      // Log audit
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(req.user?.userId, 'ROLE_CHANGE', clientIp, `Changed role of user id=${id} to role=${role}`);

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async listAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;

      const logs = await adminService.listAuditLogs(limit, skip);
      res.status(200).json(logs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardAnalytics();
      res.status(200).json(stats);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getStorageAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getStorageAnalytics();
      res.status(200).json(stats);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
