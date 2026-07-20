import { Request, Response, NextFunction } from 'express';
import { CatalogService } from '../services/CatalogService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const catalogService = new CatalogService();

export class CatalogController {
  async getColors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brand = req.query.brand as string;
      const limit = parseInt(req.query.limit as string) || 100;
      const skip = parseInt(req.query.skip as string) || 0;

      const colors = await catalogService.getColors(brand, limit, skip);
      res.status(200).json(colors);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getBrands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const brands = await catalogService.getBrands();
      res.status(200).json(brands);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getTextures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const textures = await catalogService.getTextures(limit, skip);
      res.status(200).json(textures);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin endpoints
  async addColor(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const color = await catalogService.addColor(req.body);
      res.status(201).json(color);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async addTexture(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const texture = await catalogService.addTexture(req.body);
      res.status(201).json(texture);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
