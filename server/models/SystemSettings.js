import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'general',
      'security',
      'ai_models',
      'email',
      'storage',
      'analytics',
      'backup'
    ],
    default: 'general'
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  validation: {
    required: Boolean,
    min: Number,
    max: Number,
    pattern: String,
    enum: [String]
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes
systemSettingsSchema.index({ key: 1 });
systemSettingsSchema.index({ category: 1 });

// Method to get setting value with type casting
systemSettingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Method to set setting value
systemSettingsSchema.statics.setValue = async function(key, value, adminId) {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      lastModifiedBy: adminId,
      updatedAt: new Date()
    },
    { 
      new: true, 
      upsert: true 
    }
  );
  return setting;
};

export default mongoose.model('SystemSettings', systemSettingsSchema);