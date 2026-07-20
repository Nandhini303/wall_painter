"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const AdminService_1 = require("../services/AdminService");
const adminService = new AdminService_1.AdminService();
class AdminController {
    async listUsers(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;
            const users = await adminService.listUsers(limit, skip);
            res.status(200).json(users);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async updateUserRole(req, res, next) {
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async listAuditLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const skip = parseInt(req.query.skip) || 0;
            const logs = await adminService.listAuditLogs(limit, skip);
            res.status(200).json(logs);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const stats = await adminService.getDashboardAnalytics();
            res.status(200).json(stats);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.AdminController = AdminController;
