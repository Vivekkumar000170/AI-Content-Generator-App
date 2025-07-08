import mongoose from 'mongoose';

const mediaAssetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  dimensions: {
    width: Number,
    height: Number
  },
  category: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true
  },
  tags: [String],
  altText: String,
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
mediaAssetSchema.index({ category: 1 });
mediaAssetSchema.index({ tags: 1 });
mediaAssetSchema.index({ uploadedBy: 1 });
mediaAssetSchema.index({ createdAt: -1 });

// Method to increment usage
mediaAssetSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

export default mongoose.model('MediaAsset', mediaAssetSchema);