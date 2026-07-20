import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectLayer {
  id: string;
  name: string;
  opacity: number;
  blendMode: string;
  visible: boolean;
  colorHex?: string;
  textureId?: string;
  points?: { x: number; y: number }[]; // For vector polygon points
  brushPath?: string; // Serialized SVG brush strokes
}

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  originalImageUri: string;
  processedMasksUri?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  layers: IProjectLayer[];
  canvasConfig: {
    zoomScale: number;
    panX: number;
    panY: number;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectLayerSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  opacity: { type: Number, default: 0.8 },
  blendMode: { type: String, default: 'multiply' },
  visible: { type: Boolean, default: true },
  colorHex: { type: String },
  textureId: { type: Schema.Types.ObjectId, ref: 'Texture' },
  points: [{ x: Number, y: Number }],
  brushPath: { type: String }
});

const ProjectSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  originalImageUri: { type: String, required: true },
  processedMasksUri: { type: String },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  layers: [ProjectLayerSchema],
  canvasConfig: {
    zoomScale: { type: Number, default: 1.0 },
    panX: { type: Number, default: 0 },
    panY: { type: Number, default: 0 },
    showGrid: { type: Boolean, default: true },
    snapToGrid: { type: Boolean, default: false }
  }
}, { timestamps: true });

// Index for user projects retrieval
ProjectSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<IProject>('Project', ProjectSchema);
