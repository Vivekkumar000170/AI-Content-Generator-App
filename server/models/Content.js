import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['seo-blog', 'product-description', 'ad-copy', 'social-media'],
    index: true
  },
  metadata: {
    topic: String,
    targetAudience: String,
    keywords: [String],
    platform: String,
    tone: String,
    blogType: {
      type: String,
      enum: ['ai-written', 'humanized']
    },
    productName: String,
    features: [String],
    benefits: [String]
  },
  metrics: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number,
      default: 0 // in minutes
    },
    seoScore: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    shareToken: String,
    sharedAt: Date
  },
  aiModel: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  generationTime: {
    type: Number, // in milliseconds
    default: 0
  },
  version: {
    type: Number,
    default: 1
  },
  parentContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate metrics before saving
contentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    this.metrics.wordCount = this.content.trim().split(/\s+/).length;
    
    // Calculate character count
    this.metrics.characterCount = this.content.length;
    
    // Calculate reading time (average 200 words per minute)
    this.metrics.readingTime = Math.ceil(this.metrics.wordCount / 200);
    
    // Generate basic SEO score (simplified)
    this.metrics.seoScore = this.calculateSEOScore();
  }
  next();
});

// Calculate SEO score method
contentSchema.methods.calculateSEOScore = function() {
  let score = 0;
  const content = this.content.toLowerCase();
  const title = this.title.toLowerCase();
  
  // Title length (optimal: 30-60 characters)
  if (this.title.length >= 30 && this.title.length <= 60) score += 20;
  else if (this.title.length >= 20 && this.title.length <= 80) score += 10;
  
  // Content length (optimal: 300+ words)
  if (this.metrics.wordCount >= 1000) score += 25;
  else if (this.metrics.wordCount >= 500) score += 20;
  else if (this.metrics.wordCount >= 300) score += 15;
  else if (this.metrics.wordCount >= 150) score += 10;
  
  // Keyword usage (if keywords provided)
  if (this.metadata.keywords && this.metadata.keywords.length > 0) {
    const keywordUsage = this.metadata.keywords.some(keyword => 
      content.includes(keyword.toLowerCase()) || title.includes(keyword.toLowerCase())
    );
    if (keywordUsage) score += 20;
  }
  
  // Headings (check for markdown headers)
  const headingCount = (content.match(/^#+\s/gm) || []).length;
  if (headingCount >= 3) score += 15;
  else if (headingCount >= 1) score += 10;
  
  // Meta description presence (for blog content)
  if (this.type === 'seo-blog' && content.includes('meta')) score += 10;
  
  // Call-to-action presence
  const ctaWords = ['click', 'buy', 'get', 'try', 'start', 'learn', 'discover', 'contact'];
  const hasCTA = ctaWords.some(word => content.includes(word));
  if (hasCTA) score += 10;
  
  return Math.min(100, score);
};

// Indexes for better query performance
contentSchema.index({ user: 1, createdAt: -1 });
contentSchema.index({ user: 1, type: 1 });
contentSchema.index({ user: 1, isFavorite: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ 'shareSettings.shareToken': 1 });

export default mongoose.model('Content', contentSchema);