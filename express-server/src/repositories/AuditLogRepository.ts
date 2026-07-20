import mongoose from 'mongoose';
import AuditLog, { IAuditLog } from '../models/AuditLog';

export class AuditLogRepository {
  async create(logData: Partial<IAuditLog>): Promise<IAuditLog> {
    if (logData.userId) {
      const idStr = logData.userId.toString();
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        logData.userId = new mongoose.Types.ObjectId(idStr) as any;
      } else {
        delete logData.userId;
      }
    }
    const log = new AuditLog(logData);
    return log.save();
  }

  async list(limit = 100, skip = 0): Promise<IAuditLog[]> {
    return AuditLog.find().populate('userId', 'email firstName lastName role').limit(limit).skip(skip).sort({ timestamp: -1 });
  }

  async count(): Promise<number> {
    return AuditLog.countDocuments();
  }
}
