import mongoose from 'mongoose';
import Project, { IProject } from '../models/Project';

// In-Memory Fallback Storage for offline/unconfigured DB mode
const inMemoryProjects = new Map<string, any>();

export class ProjectRepository {
  async findById(id: string): Promise<IProject | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.findById(id).populate('layers.textureId');
      }
    } catch (e) {}
    return inMemoryProjects.get(id) || null;
  }

  async findByUserId(userId: string, limit = 50, skip = 0): Promise<IProject[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.find({ userId }).limit(limit).skip(skip).sort({ updatedAt: -1 });
      }
    } catch (e) {}

    const userProjects = Array.from(inMemoryProjects.values()).filter(p => p.userId === userId || !p.userId);
    return userProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(skip, skip + limit);
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.countDocuments({ userId });
      }
    } catch (e) {}

    return Array.from(inMemoryProjects.values()).filter(p => p.userId === userId || !p.userId).length;
  }

  async listAll(limit = 1000): Promise<IProject[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.find({}).limit(limit);
      }
    } catch (e) {}
    
    return Array.from(inMemoryProjects.values()).slice(0, limit);
  }

  async create(projectData: Partial<IProject>): Promise<IProject> {
    try {
      if (mongoose.connection.readyState === 1) {
        const project = new Project(projectData);
        return await project.save();
      }
    } catch (e) {}

    const id = new mongoose.Types.ObjectId().toString();
    const now = new Date();
    const mockProject: any = {
      _id: id,
      name: projectData.name || 'New Project',
      userId: projectData.userId || id,
      originalImageUri: projectData.originalImageUri || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      processedMasksUri: projectData.processedMasksUri || [],
      layers: projectData.layers || [],
      createdAt: now,
      updatedAt: now,
      toObject: function() { return this; }
    };
    inMemoryProjects.set(id, mockProject);
    return mockProject;
  }

  async update(id: string, projectData: Partial<IProject>): Promise<IProject | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.findByIdAndUpdate(id, projectData, { new: true });
      }
    } catch (e) {}

    const existing = inMemoryProjects.get(id);
    if (!existing) {
      const mockObj: any = {
        _id: id,
        ...projectData,
        updatedAt: new Date(),
        toObject: function() { return this; }
      };
      inMemoryProjects.set(id, mockObj);
      return mockObj;
    }
    const updated = { ...existing, ...projectData, updatedAt: new Date() };
    inMemoryProjects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<IProject | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Project.findByIdAndDelete(id);
      }
    } catch (e) {}

    const existing = inMemoryProjects.get(id);
    if (existing) {
      inMemoryProjects.delete(id);
    }
    return existing || null;
  }
}
