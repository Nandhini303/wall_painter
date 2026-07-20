import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();
const controller = new AdminController();

router.use(authMiddleware as any);
router.use(requireRole(['Admin']) as any);

router.get('/users', controller.listUsers.bind(controller));
router.post('/users/invite', controller.inviteUser.bind(controller));
router.put('/users/:id/role', controller.updateUserRole.bind(controller));
router.get('/audit-logs', controller.listAuditLogs.bind(controller));
router.get('/analytics', controller.getAnalytics.bind(controller));
router.get('/storage', controller.getStorageAnalytics.bind(controller));

export default router;
