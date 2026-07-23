import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/multerMiddleware';

const router = Router();
const controller = new ProjectController();

// Apply authentication to all project routes
router.use(authMiddleware as any);

router.post('/', upload.single('image'), controller.create.bind(controller));
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.put('/:id/publish', controller.publish.bind(controller));
router.delete('/', controller.deleteAll.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;
