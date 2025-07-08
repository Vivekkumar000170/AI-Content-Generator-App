import express from 'express';
import SystemSettings from '../../models/SystemSettings.js';
import { authenticateAdmin, requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all system settings
router.get('/', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  async (req, res) => {
    try {
      const { category, isPublic } = req.query;

      const query = {};
      if (category) query.category = category;
      if (isPublic !== undefined) query.isPublic = isPublic === 'true';

      const settings = await SystemSettings.find(query)
        .populate('lastModifiedBy', 'username')
        .sort({ category: 1, key: 1 });

      res.json({ settings });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({ 
        message: 'Server error fetching system settings.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific setting
router.get('/:key', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  async (req, res) => {
    try {
      const setting = await SystemSettings.findOne({ key: req.params.key })
        .populate('lastModifiedBy', 'username');

      if (!setting) {
        return res.status(404).json({ 
          message: 'Setting not found.',
          code: 'SETTING_NOT_FOUND'
        });
      }

      res.json({ setting });
    } catch (error) {
      console.error('Get setting error:', error);
      res.status(500).json({ 
        message: 'Server error fetching setting.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Update or create setting
router.put('/:key', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  logAdminAction('settings_changed', 'settings'),
  async (req, res) => {
    try {
      const { value, type, category, description, isPublic, validation } = req.body;

      if (value === undefined) {
        return res.status(400).json({ 
          message: 'Setting value is required.',
          code: 'MISSING_VALUE'
        });
      }

      // Validate value based on type
      if (type && !validateSettingValue(value, type, validation)) {
        return res.status(400).json({ 
          message: 'Invalid value for setting type.',
          code: 'INVALID_VALUE'
        });
      }

      const settingData = {
        key: req.params.key,
        value,
        type: type || 'string',
        category: category || 'general',
        description,
        isPublic: isPublic || false,
        validation,
        lastModifiedBy: req.admin._id
      };

      const setting = await SystemSettings.findOneAndUpdate(
        { key: req.params.key },
        settingData,
        { 
          new: true, 
          upsert: true, 
          runValidators: true 
        }
      ).populate('lastModifiedBy', 'username');

      res.json({
        message: 'Setting updated successfully',
        setting
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ 
        message: 'Server error updating setting.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Delete setting
router.delete('/:key', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  logAdminAction('delete', 'settings'),
  async (req, res) => {
    try {
      const setting = await SystemSettings.findOneAndDelete({ key: req.params.key });

      if (!setting) {
        return res.status(404).json({ 
          message: 'Setting not found.',
          code: 'SETTING_NOT_FOUND'
        });
      }

      res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
      console.error('Delete setting error:', error);
      res.status(500).json({ 
        message: 'Server error deleting setting.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Bulk update settings
router.post('/bulk-update', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  logAdminAction('settings_changed', 'settings'),
  async (req, res) => {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings) || settings.length === 0) {
        return res.status(400).json({ 
          message: 'Settings array is required.',
          code: 'MISSING_SETTINGS'
        });
      }

      const updatePromises = settings.map(async (settingData) => {
        const { key, value, type, category, description, isPublic, validation } = settingData;

        if (!key || value === undefined) {
          throw new Error(`Invalid setting data for key: ${key}`);
        }

        if (type && !validateSettingValue(value, type, validation)) {
          throw new Error(`Invalid value for setting: ${key}`);
        }

        return SystemSettings.findOneAndUpdate(
          { key },
          {
            key,
            value,
            type: type || 'string',
            category: category || 'general',
            description,
            isPublic: isPublic || false,
            validation,
            lastModifiedBy: req.admin._id
          },
          { 
            new: true, 
            upsert: true, 
            runValidators: true 
          }
        );
      });

      const updatedSettings = await Promise.all(updatePromises);

      res.json({
        message: `${updatedSettings.length} settings updated successfully`,
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Bulk update settings error:', error);
      res.status(500).json({ 
        message: error.message || 'Server error updating settings.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get settings by category
router.get('/category/:category', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  async (req, res) => {
    try {
      const settings = await SystemSettings.find({ category: req.params.category })
        .populate('lastModifiedBy', 'username')
        .sort({ key: 1 });

      res.json({ settings });
    } catch (error) {
      console.error('Get settings by category error:', error);
      res.status(500).json({ 
        message: 'Server error fetching settings.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Reset settings to default
router.post('/reset-defaults', 
  authenticateAdmin, 
  requirePermission('system_settings'),
  logAdminAction('settings_changed', 'settings'),
  async (req, res) => {
    try {
      const { category } = req.body;

      // Define default settings
      const defaultSettings = getDefaultSettings();

      let settingsToReset = defaultSettings;
      if (category) {
        settingsToReset = defaultSettings.filter(setting => setting.category === category);
      }

      const resetPromises = settingsToReset.map(async (defaultSetting) => {
        return SystemSettings.findOneAndUpdate(
          { key: defaultSetting.key },
          {
            ...defaultSetting,
            lastModifiedBy: req.admin._id
          },
          { 
            new: true, 
            upsert: true, 
            runValidators: true 
          }
        );
      });

      const resetSettings = await Promise.all(resetPromises);

      res.json({
        message: `${resetSettings.length} settings reset to defaults`,
        settings: resetSettings
      });
    } catch (error) {
      console.error('Reset settings error:', error);
      res.status(500).json({ 
        message: 'Server error resetting settings.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Helper function to validate setting values
function validateSettingValue(value, type, validation) {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') return false;
      if (validation?.pattern && !new RegExp(validation.pattern).test(value)) return false;
      if (validation?.enum && !validation.enum.includes(value)) return false;
      break;
      
    case 'number':
      if (typeof value !== 'number') return false;
      if (validation?.min !== undefined && value < validation.min) return false;
      if (validation?.max !== undefined && value > validation.max) return false;
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') return false;
      break;
      
    case 'object':
      if (typeof value !== 'object' || value === null) return false;
      break;
      
    case 'array':
      if (!Array.isArray(value)) return false;
      break;
      
    default:
      return false;
  }
  
  return true;
}

// Helper function to get default settings
function getDefaultSettings() {
  return [
    {
      key: 'site_name',
      value: 'NextMind AI',
      type: 'string',
      category: 'general',
      description: 'Site name displayed in header and title',
      isPublic: true
    },
    {
      key: 'site_description',
      value: 'AI-Powered Content Generation Platform',
      type: 'string',
      category: 'general',
      description: 'Site description for SEO',
      isPublic: true
    },
    {
      key: 'max_file_size',
      value: 10485760, // 10MB
      type: 'number',
      category: 'storage',
      description: 'Maximum file upload size in bytes',
      isPublic: false,
      validation: { min: 1048576, max: 104857600 } // 1MB to 100MB
    },
    {
      key: 'session_timeout',
      value: 28800, // 8 hours
      type: 'number',
      category: 'security',
      description: 'Admin session timeout in seconds',
      isPublic: false,
      validation: { min: 3600, max: 86400 } // 1 hour to 24 hours
    },
    {
      key: 'enable_2fa',
      value: true,
      type: 'boolean',
      category: 'security',
      description: 'Enable two-factor authentication for admins',
      isPublic: false
    },
    {
      key: 'backup_enabled',
      value: true,
      type: 'boolean',
      category: 'backup',
      description: 'Enable automatic database backups',
      isPublic: false
    },
    {
      key: 'backup_frequency',
      value: 'daily',
      type: 'string',
      category: 'backup',
      description: 'Backup frequency',
      isPublic: false,
      validation: { enum: ['hourly', 'daily', 'weekly'] }
    }
  ];
}

export default router;