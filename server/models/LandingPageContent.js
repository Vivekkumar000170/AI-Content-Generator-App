import mongoose from 'mongoose';

const landingPageContentSchema = new mongoose.Schema({
  section: {
    type: String,
    required: true,
    enum: [
      'hero',
      'features',
      'about',
      'pricing',
      'testimonials',
      'faq',
      'footer',
      'navigation'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    seoTitle: String,
    seoDescription: String,
    keywords: [String],
    ogImage: String,
    canonicalUrl: String
  },
  styling: {
    backgroundColor: String,
    textColor: String,
    buttonColor: String,
    customCSS: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  publishedAt: Date,
  scheduledPublishAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes
landingPageContentSchema.index({ section: 1, isPublished: 1 });
landingPageContentSchema.index({ createdBy: 1 });

// Method to publish content
landingPageContentSchema.methods.publish = function(adminId) {
  this.isPublished = true;
  this.publishedAt = new Date();
  this.lastModifiedBy = adminId;
  return this.save();
};

// Method to create new version
landingPageContentSchema.methods.createVersion = function() {
  const versionParts = this.version.split('.').map(Number);
  versionParts[2] += 1; // Increment patch version
  this.version = versionParts.join('.');
  return this;
};

export default mongoose.model('LandingPageContent', landingPageContentSchema);