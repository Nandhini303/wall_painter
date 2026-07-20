"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserRepository_1 = require("../repositories/UserRepository");
const AuditLogRepository_1 = require("../repositories/AuditLogRepository");
const ProjectRepository_1 = require("../repositories/ProjectRepository");
const ColorRepository_1 = require("../repositories/ColorRepository");
const userRepo = new UserRepository_1.UserRepository();
const auditRepo = new AuditLogRepository_1.AuditLogRepository();
const projectRepo = new ProjectRepository_1.ProjectRepository();
const colorRepo = new ColorRepository_1.ColorRepository();
class AdminService {
    async listUsers(limit = 50, skip = 0) {
        return userRepo.listAll(limit, skip);
    }
    async updateUserRole(id, role) {
        const user = await userRepo.findById(id);
        if (!user) {
            throw new Error('User not found.');
        }
        const updated = await userRepo.update(id, { role });
        if (!updated) {
            throw new Error('Role update failed.');
        }
        return updated;
    }
    async listAuditLogs(limit = 100, skip = 0) {
        const logs = await auditRepo.list(limit, skip);
        const total = await auditRepo.count();
        return { logs, total };
    }
    async logAction(userId, action, ipAddress, details) {
        try {
            if (mongoose_1.default.connection.readyState !== 1) {
                console.log(`[AuditLog Notice] DB unready. Logged: ${action} by userId=${userId}`);
                return null;
            }
            return await auditRepo.create({
                userId: userId,
                action,
                ipAddress,
                details
            });
        }
        catch (err) {
            console.warn('[AuditLog Notice] Write skipped for audit log:', err);
            return null;
        }
    }
    async getDashboardAnalytics() {
        // Total users count
        const users = await userRepo.listAll(1000);
        const totalUsers = users.length;
        // Distinct brands and popular colors
        const colors = await colorRepo.list({}, 1000);
        const totalColors = colors.length;
        const auditLogs = await auditRepo.list(500);
        const colorPaints = auditLogs.filter(log => log.action === 'PROJECT_EDIT' && log.details.includes('color'));
        return {
            totalUsers,
            totalColors,
            activityLevel: auditLogs.length,
            popularColorStats: colorPaints.slice(0, 5).map(log => ({
                detail: log.details,
                time: log.timestamp
            }))
        };
    }
}
exports.AdminService = AdminService;
