import mongoose from 'mongoose';
import Texture, { ITexture } from '../models/Texture';

const defaultTextures: any[] = [
  { _id: 't1', name: 'Smooth Satin Finish', imageUri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', normalMapUri: '', roughness: 0.2, isActive: true },
  { _id: 't2', name: 'Textured Stucco Wall', imageUri: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', normalMapUri: '', roughness: 0.8, isActive: true },
  { _id: 't3', name: 'Venetian Plaster Elegance', imageUri: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80', normalMapUri: '', roughness: 0.5, isActive: true }
];

export class TextureRepository {
  async findById(id: string): Promise<ITexture | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Texture.findById(id);
      }
    } catch (e) {}
    return defaultTextures.find(t => t._id === id) || null;
  }

  async list(limit = 50, skip = 0): Promise<ITexture[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Texture.find().limit(limit).skip(skip).sort({ name: 1 });
      }
    } catch (e) {}
    return defaultTextures.slice(skip, skip + limit);
  }

  async create(textureData: Partial<ITexture>): Promise<ITexture> {
    try {
      if (mongoose.connection.readyState === 1) {
        const texture = new Texture(textureData);
        return await texture.save();
      }
    } catch (e) {}
    const id = new mongoose.Types.ObjectId().toString();
    const mockTexture: any = { _id: id, ...textureData, toObject: function() { return this; } };
    defaultTextures.push(mockTexture);
    return mockTexture;
  }

  async update(id: string, textureData: Partial<ITexture>): Promise<ITexture | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Texture.findByIdAndUpdate(id, textureData, { new: true });
      }
    } catch (e) {}
    const index = defaultTextures.findIndex(t => t._id === id);
    if (index === -1) return null;
    defaultTextures[index] = { ...defaultTextures[index], ...textureData };
    return defaultTextures[index];
  }

  async delete(id: string): Promise<ITexture | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Texture.findByIdAndDelete(id);
      }
    } catch (e) {}
    const index = defaultTextures.findIndex(t => t._id === id);
    if (index !== -1) {
      const removed = defaultTextures[index];
      defaultTextures.splice(index, 1);
      return removed;
    }
    return null;
  }
}
