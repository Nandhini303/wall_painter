"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const CatalogService_1 = require("../services/CatalogService");
const catalogService = new CatalogService_1.CatalogService();
class CatalogController {
    async getColors(req, res, next) {
        try {
            const brand = req.query.brand;
            const limit = parseInt(req.query.limit) || 100;
            const skip = parseInt(req.query.skip) || 0;
            const colors = await catalogService.getColors(brand, limit, skip);
            res.status(200).json(colors);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async getBrands(req, res, next) {
        try {
            const brands = await catalogService.getBrands();
            res.status(200).json(brands);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async getTextures(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const skip = parseInt(req.query.skip) || 0;
            const textures = await catalogService.getTextures(limit, skip);
            res.status(200).json(textures);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    // Admin endpoints
    async addColor(req, res, next) {
        try {
            const color = await catalogService.addColor(req.body);
            res.status(201).json(color);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    async addTexture(req, res, next) {
        try {
            const texture = await catalogService.addTexture(req.body);
            res.status(201).json(texture);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}
exports.CatalogController = CatalogController;
