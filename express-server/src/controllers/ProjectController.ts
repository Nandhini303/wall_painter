import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AdminService } from '../services/AdminService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const projectService = new ProjectService();
const adminService = new AdminService();

export class ProjectController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      const userId = req.user?.userId;
      if (!name || !userId) {
        res.status(400).json({ error: 'Project name is required.' });
        return;
      }

      const file = req.file; // Uploaded via multer
      const project = await projectService.createProject(userId, name, file);

      // Log audit
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(userId, 'PROJECT_CREATE', clientIp, `Created project name=${project.name} id=${project._id}`);

      res.status(201).json(project);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!id || !userId) {
        res.status(400).json({ error: 'Project ID is required.' });
        return;
      }

      const project = await projectService.getProject(id, userId);
      res.status(200).json(project);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required.' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const result = await projectService.listProjects(userId, limit, skip);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!id || !userId) {
        res.status(400).json({ error: 'Project ID is required.' });
        return;
      }

      const updated = await projectService.updateProject(id, userId, req.body);

      // Log audit
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(userId, 'PROJECT_EDIT', clientIp, `Updated project id=${id} layers_count=${req.body.layers?.length}`);

      res.status(200).json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async publish(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!id || !userId) {
        res.status(400).json({ error: 'Project ID is required.' });
        return;
      }

      const published = await projectService.publishProject(id, userId);

      // Log audit
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(userId, 'PROJECT_PUBLISH', clientIp, `Published project id=${id}`);

      res.status(200).json(published);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      if (!id || !userId) {
        res.status(400).json({ error: 'Project ID is required.' });
        return;
      }

      await projectService.deleteProject(id, userId);

      // Log audit
      const clientIp = req.ip || 'unknown';
      await adminService.logAction(userId, 'PROJECT_DELETE', clientIp, `Deleted project id=${id}`);

      res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
