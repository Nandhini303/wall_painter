"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Project_1 = __importDefault(require("../models/Project"));
// In-Memory Fallback Storage for offline/unconfigured DB mode
const inMemoryProjects = new Map();
class ProjectRepository {
    async findById(id) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await Project_1.default.findById(id).populate('layers.textureId');
            }
        }
        catch (e) { }
        return inMemoryProjects.get(id) || null;
    }
    async findByUserId(userId, limit = 50, skip = 0) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await Project_1.default.find({ userId }).limit(limit).skip(skip).sort({ updatedAt: -1 });
            }
        }
        catch (e) { }
        const userProjects = Array.from(inMemoryProjects.values()).filter(p => p.userId === userId || !p.userId);
        return userProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(skip, skip + limit);
    }
    async countByUserId(userId) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await Project_1.default.countDocuments({ userId });
            }
        }
        catch (e) { }
        return Array.from(inMemoryProjects.values()).filter(p => p.userId === userId || !p.userId).length;
    }
    async create(projectData) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                const project = new Project_1.default(projectData);
                return await project.save();
            }
        }
        catch (e) { }
        const id = new mongoose_1.default.Types.ObjectId().toString();
        const now = new Date();
        const mockProject = {
            _id: id,
            name: projectData.name || 'New Project',
            userId: projectData.userId || id,
            originalImageUri: projectData.originalImageUri || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
            processedMasksUri: projectData.processedMasksUri || [],
            layers: projectData.layers || [],
            createdAt: now,
            updatedAt: now,
            toObject: function () { return this; }
        };
        inMemoryProjects.set(id, mockProject);
        return mockProject;
    }
    async update(id, projectData) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await Project_1.default.findByIdAndUpdate(id, projectData, { new: true });
            }
        }
        catch (e) { }
        const existing = inMemoryProjects.get(id);
        if (!existing) {
            const mockObj = {
                _id: id,
                ...projectData,
                updatedAt: new Date(),
                toObject: function () { return this; }
            };
            inMemoryProjects.set(id, mockObj);
            return mockObj;
        }
        const updated = { ...existing, ...projectData, updatedAt: new Date() };
        inMemoryProjects.set(id, updated);
        return updated;
    }
    async delete(id) {
        try {
            if (mongoose_1.default.connection.readyState === 1) {
                return await Project_1.default.findByIdAndDelete(id);
            }
        }
        catch (e) { }
        const existing = inMemoryProjects.get(id);
        if (existing) {
            inMemoryProjects.delete(id);
        }
        return existing || null;
    }
}
exports.ProjectRepository = ProjectRepository;
