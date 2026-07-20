import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { AuditLogRepository } from '../repositories/AuditLogRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ColorRepository } from '../repositories/ColorRepository';
import { IUser } from '../models/User';
import { IAuditLog } from '../models/AuditLog';

const userRepo = new UserRepository();
const auditRepo = new AuditLogRepository();
const projectRepo = new ProjectRepository();
const colorRepo = new ColorRepository();

export class AdminService {
  async inviteUser(email: string, role: 'Admin' | 'Designer' | 'User', workspace?: string): Promise<IUser> {
    const existing = await userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User already exists with this email.');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(Math.random().toString(36).slice(-10), salt); // Dummy password
    const newUser = await userRepo.create({
      email,
      firstName: 'Invited',
      lastName: 'User',
      passwordHash,
      role,
      status: 'Active',
      isVerified: false
    });
    return newUser;
  }

  async listUsers(limit = 50, skip = 0): Promise<IUser[]> {
    return userRepo.listAll(limit, skip);
  }

  async updateUserRole(id: string, role: 'Admin' | 'Designer' | 'User'): Promise<IUser> {
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

  async listAuditLogs(limit = 100, skip = 0): Promise<{ logs: IAuditLog[]; total: number }> {
    const logs = await auditRepo.list(limit, skip);
    const total = await auditRepo.count();
    return { logs, total };
  }

  async logAction(userId: string | undefined, action: string, ipAddress: string, details: string): Promise<IAuditLog | null> {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log(`[AuditLog Notice] DB unready. Logged: ${action} by userId=${userId}`);
        return null;
      }
      return await auditRepo.create({
        userId: userId as any,
        action,
        ipAddress,
        details
      });
    } catch (err) {
      console.warn('[AuditLog Notice] Write skipped for audit log:', err);
      return null;
    }
  }

  async getDashboardAnalytics(): Promise<any> {
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

  async getStorageAnalytics(): Promise<any> {
    const projects = await projectRepo.listAll(1000);
    
    let imageSize = 0;
    let mapSize = 0;
    let assetSize = 300 * 1024 * 1024; // Static 300 MB for "Assets" like palettes
    const assets: any[] = [];

    projects.forEach(p => {
      // Images (assume 2.5MB per image)
      if (p.originalImageUri) {
        imageSize += 2.5 * 1024 * 1024;
        assets.push({
          id: p._id.toString() + '_img',
          name: p.originalImageUri.split('/').pop()?.split('?')[0] || `img_${p._id}.jpg`,
          type: 'Image',
          sizeBytes: 2.5 * 1024 * 1024,
          date: p.createdAt
        });
      }
      
      // Canvas JSON Maps (count layers string length)
      if (p.layers && p.layers.length > 0) {
        const jsonStr = JSON.stringify(p.layers);
        const bytes = Buffer.byteLength(jsonStr, 'utf8');
        mapSize += bytes;
        assets.push({
          id: p._id.toString() + '_map',
          name: `map_${p._id}.json`,
          type: 'Canvas Map',
          sizeBytes: bytes,
          date: p.updatedAt
        });
      }
    });

    const totalUsed = imageSize + mapSize + assetSize;
    const totalQuota = 10 * 1024 * 1024 * 1024; // 10 GB
    
    return {
      quota: {
        totalUsedBytes: totalUsed,
        totalQuotaBytes: totalQuota,
        imageBytes: imageSize,
        mapBytes: mapSize,
        assetBytes: assetSize
      },
      assets: assets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }
}
