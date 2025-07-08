import express from 'express';
import LandingPageContent from '../../models/LandingPageContent.js';
import { authenticateAdmin, requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all content sections
router.get('/', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  async (req, res) => {
    try {
      const { section, published } = req.query;
      
      const query = {};
      if (section) query.section = section;
      if (published !== undefined) query.isPublished = published === 'true';

      const content = await LandingPageContent.find(query)
        .populate('createdBy lastModifiedBy', 'username email')
        .sort({ section: 1, createdAt: -1 });

      res.json({ content });
    } catch (error) {
      console.error('Get content error:', error);
      res.status(500).json({ 
        message: 'Server error fetching content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific content section
router.get('/:id', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  async (req, res) => {
    try {
      const content = await LandingPageContent.findById(req.params.id)
        .populate('createdBy lastModifiedBy', 'username email');

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({ content });
    } catch (error) {
      console.error('Get content by ID error:', error);
      res.status(500).json({ 
        message: 'Server error fetching content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Create new content section
router.post('/', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('create', 'content'),
  async (req, res) => {
    try {
      const contentData = {
        ...req.body,
        createdBy: req.admin._id,
        lastModifiedBy: req.admin._id
      };

      const content = new LandingPageContent(contentData);
      await content.save();

      await content.populate('createdBy', 'username email');

      res.status(201).json({
        message: 'Content created successfully',
        content
      });
    } catch (error) {
      console.error('Create content error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        });
      }
      
      res.status(500).json({ 
        message: 'Server error creating content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Update content section
router.put('/:id', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('update', 'content'),
  async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        lastModifiedBy: req.admin._id
      };

      // Create new version if content is being modified
      const existingContent = await LandingPageContent.findById(req.params.id);
      if (existingContent && req.body.content !== existingContent.content) {
        existingContent.createVersion();
        updateData.version = existingContent.version;
      }

      const content = await LandingPageContent.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy lastModifiedBy', 'username email');

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({
        message: 'Content updated successfully',
        content
      });
    } catch (error) {
      console.error('Update content error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        });
      }
      
      res.status(500).json({ 
        message: 'Server error updating content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Delete content section
router.delete('/:id', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('delete', 'content'),
  async (req, res) => {
    try {
      const content = await LandingPageContent.findByIdAndDelete(req.params.id);

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Delete content error:', error);
      res.status(500).json({ 
        message: 'Server error deleting content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Publish content
router.patch('/:id/publish', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('content_published', 'content'),
  async (req, res) => {
    try {
      const content = await LandingPageContent.findById(req.params.id);

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      await content.publish(req.admin._id);

      res.json({
        message: 'Content published successfully',
        content
      });
    } catch (error) {
      console.error('Publish content error:', error);
      res.status(500).json({ 
        message: 'Server error publishing content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Unpublish content
router.patch('/:id/unpublish', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('content_unpublished', 'content'),
  async (req, res) => {
    try {
      const content = await LandingPageContent.findByIdAndUpdate(
        req.params.id,
        { 
          isPublished: false,
          lastModifiedBy: req.admin._id
        },
        { new: true }
      );

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({
        message: 'Content unpublished successfully',
        content
      });
    } catch (error) {
      console.error('Unpublish content error:', error);
      res.status(500).json({ 
        message: 'Server error unpublishing content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Schedule content publication
router.patch('/:id/schedule', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  logAdminAction('update', 'content'),
  async (req, res) => {
    try {
      const { scheduledPublishAt } = req.body;

      if (!scheduledPublishAt) {
        return res.status(400).json({ 
          message: 'Scheduled publish date is required.',
          code: 'MISSING_SCHEDULE_DATE'
        });
      }

      const scheduleDate = new Date(scheduledPublishAt);
      if (scheduleDate <= new Date()) {
        return res.status(400).json({ 
          message: 'Scheduled date must be in the future.',
          code: 'INVALID_SCHEDULE_DATE'
        });
      }

      const content = await LandingPageContent.findByIdAndUpdate(
        req.params.id,
        { 
          scheduledPublishAt: scheduleDate,
          lastModifiedBy: req.admin._id
        },
        { new: true }
      );

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      res.json({
        message: 'Content scheduled successfully',
        content
      });
    } catch (error) {
      console.error('Schedule content error:', error);
      res.status(500).json({ 
        message: 'Server error scheduling content.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get content versions/history
router.get('/:id/versions', 
  authenticateAdmin, 
  requirePermission('manage_content'),
  async (req, res) => {
    try {
      const content = await LandingPageContent.findById(req.params.id);

      if (!content) {
        return res.status(404).json({ 
          message: 'Content not found.',
          code: 'CONTENT_NOT_FOUND'
        });
      }

      // Get all versions of this content section
      const versions = await LandingPageContent.find({
        section: content.section
      })
      .populate('createdBy lastModifiedBy', 'username email')
      .sort({ createdAt: -1 });

      res.json({ versions });
    } catch (error) {
      console.error('Get content versions error:', error);
      res.status(500).json({ 
        message: 'Server error fetching content versions.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;