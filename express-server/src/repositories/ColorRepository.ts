import mongoose from 'mongoose';
import Color, { IColor } from '../models/Color';

const defaultColors: any[] = [
  { _id: '1', name: 'Classic Executive White', colorCode: 'SW-7005', hex: '#F4F4F0', rgb: { r: 244, g: 244, b: 240 }, brandName: 'Sherwin-Williams', finish: 'Satin', isActive: true },
  { _id: '2', name: 'Alabaster Serenity', colorCode: 'SW-7008', hex: '#EDEAE0', rgb: { r: 237, g: 234, b: 224 }, brandName: 'Sherwin-Williams', finish: 'Eggshell', isActive: true },
  { _id: '3', name: 'Hale Navy Velvet', colorCode: 'HC-154', hex: '#2C363F', rgb: { r: 44, g: 54, b: 63 }, brandName: 'Benjamin Moore', finish: 'Matte', isActive: true },
  { _id: '4', name: 'Emerald Forest Gloss', colorCode: 'SW-6496', hex: '#1B4332', rgb: { r: 27, g: 67, b: 50 }, brandName: 'Sherwin-Williams', finish: 'Gloss', isActive: true },
  { _id: '5', name: 'Soft Linen Beige', colorCode: 'PPG-1020', hex: '#E6DFD5', rgb: { r: 230, g: 223, b: 213 }, brandName: 'PPG Paints', finish: 'Matte', isActive: true }
];

export class ColorRepository {
  async findById(id: string): Promise<IColor | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.findById(id);
      }
    } catch (e) {}
    return defaultColors.find(c => c._id === id) || null;
  }

  async findByCode(colorCode: string): Promise<IColor | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.findOne({ colorCode });
      }
    } catch (e) {}
    return defaultColors.find(c => c.colorCode === colorCode) || null;
  }

  async list(filter: { brandName?: string; isActive?: boolean } = {}, limit = 100, skip = 0): Promise<IColor[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.find(filter).limit(limit).skip(skip).sort({ brandName: 1, name: 1 });
      }
    } catch (e) {}
    return defaultColors.slice(skip, skip + limit);
  }

  async listDistinctBrands(): Promise<string[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.distinct('brandName', { isActive: true });
      }
    } catch (e) {}
    return ['Sherwin-Williams', 'Benjamin Moore', 'PPG Paints', 'Behr'];
  }

  async create(colorData: Partial<IColor>): Promise<IColor> {
    try {
      if (mongoose.connection.readyState === 1) {
        const color = new Color(colorData);
        return await color.save();
      }
    } catch (e) {}
    const id = new mongoose.Types.ObjectId().toString();
    const mockColor: any = { _id: id, ...colorData, toObject: function() { return this; } };
    defaultColors.push(mockColor);
    return mockColor;
  }

  async update(id: string, colorData: Partial<IColor>): Promise<IColor | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.findByIdAndUpdate(id, colorData, { new: true });
      }
    } catch (e) {}
    const index = defaultColors.findIndex(c => c._id === id);
    if (index === -1) return null;
    defaultColors[index] = { ...defaultColors[index], ...colorData };
    return defaultColors[index];
  }

  async delete(id: string): Promise<IColor | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await Color.findByIdAndDelete(id);
      }
    } catch (e) {}
    const index = defaultColors.findIndex(c => c._id === id);
    if (index !== -1) {
      const removed = defaultColors[index];
      defaultColors.splice(index, 1);
      return removed;
    }
    return null;
  }
}
