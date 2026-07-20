import mongoose, { Schema, Document } from 'mongoose';

export interface ITexture extends Document {
  name: string;
  imageUri: string;
  roughnessMapUri?: string;
  scaleDefault: number;
}

const TextureSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  imageUri: { type: String, required: true },
  roughnessMapUri: { type: String },
  scaleDefault: { type: Number, default: 1.0 }
});

export default mongoose.model<ITexture>('Texture', TextureSchema);
