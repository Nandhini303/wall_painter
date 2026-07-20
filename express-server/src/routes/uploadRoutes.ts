import { Router } from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { UploadController } from '../controllers/UploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'canvas_assets',
    allowed_formats: ['jpg', 'png', 'webp', 'svg']
  } as any,
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

const router = Router();
const controller = new UploadController();

router.use(authMiddleware as any);

router.post('/image', upload.single('file'), controller.uploadImage.bind(controller));
router.post('/texture', upload.single('file'), controller.uploadImage.bind(controller));
router.get('/', controller.listAssets.bind(controller));
router.delete('/:publicId', controller.deleteAsset.bind(controller));

export default router;
