import { ColorRepository } from '../repositories/ColorRepository';
import { TextureRepository } from '../repositories/TextureRepository';
import { IColor } from '../models/Color';
import { ITexture } from '../models/Texture';

const colorRepo = new ColorRepository();
const textureRepo = new TextureRepository();

export class CatalogService {
  async getColors(brandName?: string, limit = 100, skip = 0): Promise<IColor[]> {
    const filter: { brandName?: string; isActive: boolean } = { isActive: true };
    if (brandName) {
      filter.brandName = brandName;
    }
    return colorRepo.list(filter, limit, skip);
  }

  async getBrands(): Promise<string[]> {
    return colorRepo.listDistinctBrands();
  }

  async getTextures(limit = 50, skip = 0): Promise<ITexture[]> {
    return textureRepo.list(limit, skip);
  }

  // Admin methods
  async addColor(colorData: Partial<IColor>): Promise<IColor> {
    const existing = await colorRepo.findByCode(colorData.colorCode || '');
    if (existing) {
      throw new Error('Color code already exists in catalog.');
    }
    return colorRepo.create(colorData);
  }

  async addTexture(textureData: Partial<ITexture>): Promise<ITexture> {
    return textureRepo.create(textureData);
  }
}
