"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const ColorRepository_1 = require("../repositories/ColorRepository");
const TextureRepository_1 = require("../repositories/TextureRepository");
const colorRepo = new ColorRepository_1.ColorRepository();
const textureRepo = new TextureRepository_1.TextureRepository();
class CatalogService {
    async getColors(brandName, limit = 100, skip = 0) {
        const filter = { isActive: true };
        if (brandName) {
            filter.brandName = brandName;
        }
        return colorRepo.list(filter, limit, skip);
    }
    async getBrands() {
        return colorRepo.listDistinctBrands();
    }
    async getTextures(limit = 50, skip = 0) {
        return textureRepo.list(limit, skip);
    }
    // Admin methods
    async addColor(colorData) {
        const existing = await colorRepo.findByCode(colorData.colorCode || '');
        if (existing) {
            throw new Error('Color code already exists in catalog.');
        }
        return colorRepo.create(colorData);
    }
    async addTexture(textureData) {
        return textureRepo.create(textureData);
    }
}
exports.CatalogService = CatalogService;
