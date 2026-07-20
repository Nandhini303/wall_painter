import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  publicId: string;
  secureUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  sizeBytes?: number;
  type: 'Image' | 'Texture' | 'Pattern';
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema: Schema = new Schema(
  {
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    sizeBytes: { type: Number },
    type: { type: String, enum: ['Image', 'Texture', 'Pattern'], required: true, default: 'Image' },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IAsset>('Asset', AssetSchema);
