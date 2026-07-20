import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  ipAddress: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true, uppercase: true },
  ipAddress: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
