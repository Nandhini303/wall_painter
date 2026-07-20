"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjectController_1 = require("../controllers/ProjectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multerMiddleware_1 = require("../middleware/multerMiddleware");
const router = (0, express_1.Router)();
const controller = new ProjectController_1.ProjectController();
// Apply authentication to all project routes
router.use(authMiddleware_1.authMiddleware);
router.post('/', multerMiddleware_1.upload.single('image'), controller.create.bind(controller));
router.get('/', controller.list.bind(controller));
router.get('/:id', controller.get.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.put('/:id/publish', controller.publish.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
exports.default = router;
