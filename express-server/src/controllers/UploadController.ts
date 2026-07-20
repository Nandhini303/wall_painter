import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import cloudinary from '../config/cloudinary';
import Asset from '../models/Asset';

export class UploadController {
  async uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided.' });
        return;
      }
      const type = (req.body.type as any) || 'Image';
      const name = req.file.originalname;
      const fileData = req.file as any;

      const asset = new Asset({
        publicId: fileData.filename,
        secureUrl: fileData.path,
        thumbnailUrl: fileData.path.replace('/upload/', '/upload/c_thumb,w_200,h_200/'),
        width: 0, 
        height: 0,
        format: fileData.mimetype,
        sizeBytes: fileData.size,
        type,
        userId: req.user?.userId,
        name
      });
      await asset.save();
      
      const { getIo } = require('../sockets/socketHandler');
      const io = getIo();
      if (io) {
        io.emit('asset:uploaded', asset);
      }
      
      res.status(201).json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async listAssets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const type = req.query.type as string;
      const query: any = { userId: req.user?.userId };
      if (type) query.type = type;
      
      const assets = await Asset.find(query).sort({ createdAt: -1 });
      res.status(200).json(assets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteAsset(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const publicId = req.params.publicId;
      const asset = await Asset.findOne({ publicId, userId: req.user?.userId });
      if (!asset) {
        res.status(404).json({ error: 'Asset not found.' });
        return;
      }
      
      await cloudinary.uploader.destroy(publicId);
      await Asset.deleteOne({ _id: asset._id });
      
      const { getIo } = require('../sockets/socketHandler');
      const io = getIo();
      if (io) {
        io.emit('asset:deleted', { publicId });
      }
      
      res.status(200).json({ message: 'Asset deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
