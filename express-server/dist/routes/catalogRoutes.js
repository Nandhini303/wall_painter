"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CatalogController_1 = require("../controllers/CatalogController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbacMiddleware_1 = require("../middleware/rbacMiddleware");
const router = (0, express_1.Router)();
const controller = new CatalogController_1.CatalogController();
// Public routes (auth still good but not strictly required for viewing colors if needed; let's keep them viewable by authenticated users)
router.use(authMiddleware_1.authMiddleware);
router.get('/colors', controller.getColors.bind(controller));
router.get('/brands', controller.getBrands.bind(controller));
router.get('/textures', controller.getTextures.bind(controller));
// Admin only routes for adding new color/textures
router.post('/colors', (0, rbacMiddleware_1.requireRole)(['Admin']), controller.addColor.bind(controller));
router.post('/textures', (0, rbacMiddleware_1.requireRole)(['Admin']), controller.addTexture.bind(controller));
exports.default = router;
