import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import MediaAsset from '../../models/MediaAsset.js';
import { authenticateAdmin, requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/media';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'video/mp4': 'video',
    'video/webm': 'video',
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'application/pdf': 'document',
    'text/plain': 'document'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all media assets
router.get('/', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Build query
      const query = {};
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { filename: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [assets, total] = await Promise.all([
        MediaAsset.find(query)
          .populate('uploadedBy', 'username email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        MediaAsset.countDocuments(query)
      ]);

      res.json({
        assets,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get media assets error:', error);
      res.status(500).json({ 
        message: 'Server error fetching media assets.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Upload media asset
router.post('/upload', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  upload.single('file'),
  logAdminAction('media_uploaded', 'media'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No file uploaded.',
          code: 'NO_FILE'
        });
      }

      const { tags, altText, description, isPublic } = req.body;

      // Determine category based on mime type
      const categoryMap = {
        'image/': 'image',
        'video/': 'video',
        'audio/': 'audio',
        'application/pdf': 'document',
        'text/': 'document'
      };

      let category = 'other';
      for (const [prefix, cat] of Object.entries(categoryMap)) {
        if (req.file.mimetype.startsWith(prefix) || req.file.mimetype === prefix) {
          category = cat;
          break;
        }
      }

      // Generate thumbnail for images
      let thumbnailUrl = null;
      let dimensions = null;

      if (category === 'image') {
        try {
          const image = sharp(req.file.path);
          const metadata = await image.metadata();
          dimensions = {
            width: metadata.width,
            height: metadata.height
          };

          // Create thumbnail
          const thumbnailPath = req.file.path.replace(
            path.extname(req.file.filename),
            '_thumb' + path.extname(req.file.filename)
          );

          await image
            .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
            .toFile(thumbnailPath);

          thumbnailUrl = `/uploads/media/${path.basename(thumbnailPath)}`;
        } catch (imageError) {
          console.error('Thumbnail generation error:', imageError);
        }
      }

      // Create media asset record
      const mediaAsset = new MediaAsset({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/media/${req.file.filename}`,
        thumbnailUrl,
        dimensions,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        altText,
        description,
        isPublic: isPublic === 'true',
        uploadedBy: req.admin._id
      });

      await mediaAsset.save();
      await mediaAsset.populate('uploadedBy', 'username email');

      res.status(201).json({
        message: 'File uploaded successfully',
        asset: mediaAsset
      });
    } catch (error) {
      console.error('Upload media error:', error);
      
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File too large. Maximum size is 10MB.',
          code: 'FILE_TOO_LARGE'
        });
      }
      
      res.status(500).json({ 
        message: 'Server error uploading file.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific media asset
router.get('/:id', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  async (req, res) => {
    try {
      const asset = await MediaAsset.findById(req.params.id)
        .populate('uploadedBy', 'username email');

      if (!asset) {
        return res.status(404).json({ 
          message: 'Media asset not found.',
          code: 'ASSET_NOT_FOUND'
        });
      }

      res.json({ asset });
    } catch (error) {
      console.error('Get media asset error:', error);
      res.status(500).json({ 
        message: 'Server error fetching media asset.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Update media asset metadata
router.put('/:id', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  logAdminAction('update', 'media'),
  async (req, res) => {
    try {
      const { tags, altText, description, isPublic } = req.body;

      const updateData = {};
      if (tags !== undefined) updateData.tags = tags.split(',').map(tag => tag.trim());
      if (altText !== undefined) updateData.altText = altText;
      if (description !== undefined) updateData.description = description;
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const asset = await MediaAsset.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'username email');

      if (!asset) {
        return res.status(404).json({ 
          message: 'Media asset not found.',
          code: 'ASSET_NOT_FOUND'
        });
      }

      res.json({
        message: 'Media asset updated successfully',
        asset
      });
    } catch (error) {
      console.error('Update media asset error:', error);
      res.status(500).json({ 
        message: 'Server error updating media asset.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Delete media asset
router.delete('/:id', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  logAdminAction('media_deleted', 'media'),
  async (req, res) => {
    try {
      const asset = await MediaAsset.findByIdAndDelete(req.params.id);

      if (!asset) {
        return res.status(404).json({ 
          message: 'Media asset not found.',
          code: 'ASSET_NOT_FOUND'
        });
      }

      // Delete physical files
      const filePath = path.join('uploads/media', asset.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete thumbnail if exists
      if (asset.thumbnailUrl) {
        const thumbnailPath = path.join('uploads/media', path.basename(asset.thumbnailUrl));
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

      res.json({ message: 'Media asset deleted successfully' });
    } catch (error) {
      console.error('Delete media asset error:', error);
      res.status(500).json({ 
        message: 'Server error deleting media asset.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Bulk delete media assets
router.post('/bulk-delete', 
  authenticateAdmin, 
  requirePermission('manage_media'),
  logAdminAction('delete', 'media'),
  async (req, res) => {
    try {
      const { assetIds } = req.body;

      if (!Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ 
          message: 'Asset IDs array is required.',
          code: 'MISSING_ASSET_IDS'
        });
      }

      const assets = await MediaAsset.find({ _id: { $in: assetIds } });
      
      // Delete physical files
      for (const asset of assets) {
        const filePath = path.join('uploads/media', asset.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (asset.thumbnailUrl) {
          const thumbnailPath = path.join('uploads/media', path.basename(asset.thumbnailUrl));
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        }
      }

      // Delete database records
      const result = await MediaAsset.deleteMany({ _id: { $in: assetIds } });

      res.json({
        message: `${result.deletedCount} media assets deleted successfully`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Bulk delete media error:', error);
      res.status(500).json({ 
        message: 'Server error deleting media assets.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get media usage statistics
router.get('/stats/usage', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const stats = await MediaAsset.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSize: { $sum: '$size' },
            avgSize: { $avg: '$size' },
            totalUsage: { $sum: '$usageCount' }
          }
        }
      ]);

      const totalStats = await MediaAsset.aggregate([
        {
          $group: {
            _id: null,
            totalAssets: { $sum: 1 },
            totalSize: { $sum: '$size' },
            totalUsage: { $sum: '$usageCount' }
          }
        }
      ]);

      res.json({
        byCategory: stats,
        overall: totalStats[0] || {
          totalAssets: 0,
          totalSize: 0,
          totalUsage: 0
        }
      });
    } catch (error) {
      console.error('Get media stats error:', error);
      res.status(500).json({ 
        message: 'Server error fetching media statistics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;