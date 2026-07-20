import mongoose, { Schema, Document } from 'mongoose';

export interface IColor extends Document {
  brandName: string;
  colorCode: string;
  name: string;
  hexCode: string;
  r: number;
  g: number;
  b: number;
  isActive: boolean;
}

const ColorSchema: Schema = new Schema({
  brandName: { type: String, required: true, trim: true },
  colorCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  hexCode: { type: String, required: true, trim: true },
  r: { type: Number, required: true, min: 0, max: 255 },
  g: { type: Number, required: true, min: 0, max: 255 },
  b: { type: Number, required: true, min: 0, max: 255 },
  isActive: { type: Boolean, default: true }
});

// Indexes for brand catalog filtering
ColorSchema.index({ brandName: 1, isActive: 1 });

export default mongoose.model<IColor>('Color', ColorSchema);
