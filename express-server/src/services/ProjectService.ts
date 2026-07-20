import { ProjectRepository } from '../repositories/ProjectRepository';
import { IProject } from '../models/Project';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

const projectRepo = new ProjectRepository();

export class ProjectService {
  async createProject(userId: string, name: string, file?: Express.Multer.File): Promise<IProject> {
    let imageUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80'; // Fallback default

    if (file) {
      try {
        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'smart_wall_paint_visualizer',
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
        
        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to mock URL. Error:', err);
        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    return projectRepo.create({
      userId: userId as any,
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

  async getProject(id: string, userId: string): Promise<IProject> {
    const project = await projectRepo.findById(id);
    if (!project) {
      throw new Error('Project not found.');
    }
    if (project.userId.toString() !== userId) {
      throw new Error('Access denied: You do not own this project.');
    }
    return project;
  }

  async listProjects(userId: string, limit = 50, skip = 0): Promise<{ projects: IProject[]; total: number }> {
    const projects = await projectRepo.findByUserId(userId, limit, skip);
    const total = await projectRepo.countByUserId(userId);
    return { projects, total };
  }

  async updateProject(id: string, userId: string, updateData: Partial<IProject>): Promise<IProject> {
    const project = await this.getProject(id, userId); // Verifies ownership
    
    const updated = await projectRepo.update(id, updateData);
    if (!updated) {
      throw new Error('Project update failed.');
    }
    return updated;
  }

  async publishProject(id: string, userId: string): Promise<IProject> {
    const project = await this.getProject(id, userId);
    return this.updateProject(id, userId, {
      status: 'published',
      publishedAt: new Date()
    });
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    await this.getProject(id, userId); // Verifies ownership
    await projectRepo.delete(id);
  }
}
