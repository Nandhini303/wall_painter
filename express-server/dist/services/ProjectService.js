"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const ProjectRepository_1 = require("../repositories/ProjectRepository");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const projectRepo = new ProjectRepository_1.ProjectRepository();
class ProjectService {
    async createProject(userId, name, file) {
        let imageUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'; // Fallback default
        if (file) {
            try {
                // Upload image to Cloudinary
                const uploadResult = await cloudinary_1.default.uploader.upload(file.path, {
                    folder: 'smart_wall_paint_visualizer',
                    resource_type: 'image'
                });
                imageUrl = uploadResult.secure_url;
                // Clean up temp file
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
            catch (err) {
                console.warn('Cloudinary upload failed, falling back to mock URL. Error:', err);
                // Clean up temp file
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
        }
        return projectRepo.create({
            userId: userId,
            name,
            originalImageUri: imageUrl,
            layers: [
                {
                    id: 'base-layer',
                    name: 'Base Layer',
                    opacity: 1.0,
                    blendMode: 'normal',
                    visible: true
                }
            ],
            canvasConfig: {
                zoomScale: 1.0,
                panX: 0,
                panY: 0,
                showGrid: true,
                snapToGrid: false
            }
        });
    }
    async getProject(id, userId) {
        const project = await projectRepo.findById(id);
        if (!project) {
            throw new Error('Project not found.');
        }
        if (project.userId.toString() !== userId) {
            throw new Error('Access denied: You do not own this project.');
        }
        return project;
    }
    async listProjects(userId, limit = 50, skip = 0) {
        const projects = await projectRepo.findByUserId(userId, limit, skip);
        const total = await projectRepo.countByUserId(userId);
        return { projects, total };
    }
    async updateProject(id, userId, updateData) {
        const project = await this.getProject(id, userId); // Verifies ownership
        const updated = await projectRepo.update(id, updateData);
        if (!updated) {
            throw new Error('Project update failed.');
        }
        return updated;
    }
    async publishProject(id, userId) {
        const project = await this.getProject(id, userId);
        return this.updateProject(id, userId, {
            status: 'published',
            publishedAt: new Date()
        });
    }
    async deleteProject(id, userId) {
        await this.getProject(id, userId); // Verifies ownership
        await projectRepo.delete(id);
    }
}
exports.ProjectService = ProjectService;
