"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const ProjectService_1 = require("../services/ProjectService");
const AdminService_1 = require("../services/AdminService");
const projectService = new ProjectService_1.ProjectService();
const adminService = new AdminService_1.AdminService();
class ProjectController {
    async create(req, res, next) {
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async get(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!id || !userId) {
                res.status(400).json({ error: 'Project ID is required.' });
                return;
            }
            const project = await projectService.getProject(id, userId);
            res.status(200).json(project);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async list(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required.' });
                return;
            }
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;
            const result = await projectService.listProjects(userId, limit, skip);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async update(req, res, next) {
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async publish(req, res, next) {
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async delete(req, res, next) {
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
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.ProjectController = ProjectController;
