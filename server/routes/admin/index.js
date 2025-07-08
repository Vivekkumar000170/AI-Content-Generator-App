import express from 'express';
import authRoutes from './auth.js';
import botRoutes from './bots.js';
import contentRoutes from './content.js';
import mediaRoutes from './media.js';
import analyticsRoutes from './analytics.js';
import userRoutes from './users.js';
import settingsRoutes from './settings.js';
import auditRoutes from './audit.js';

const router = express.Router();

// Mount all admin routes
router.use('/auth', authRoutes);
router.use('/bots', botRoutes);
router.use('/content', contentRoutes);
router.use('/media', mediaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit', auditRoutes);

// Admin panel health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Admin panel API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;