import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();
const controller = new CatalogController();

// Public routes (auth still good but not strictly required for viewing colors if needed; let's keep them viewable by authenticated users)
router.use(authMiddleware as any);

router.get('/colors', controller.getColors.bind(controller));
router.get('/brands', controller.getBrands.bind(controller));
router.get('/textures', controller.getTextures.bind(controller));

// Admin only routes for adding new color/textures
router.post('/colors', requireRole(['Admin']) as any, controller.addColor.bind(controller));
router.post('/textures', requireRole(['Admin']) as any, controller.addTexture.bind(controller));

export default router;
