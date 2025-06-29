import express from 'express';
import Content from '../models/Content.js';
import Analytics from '../models/Analytics.js';
import { authenticate, checkUsageLimit } from '../middleware/auth.js';
import { generateAIContent } from '../services/openai.js';

const router = express.Router();

// Generate content
router.post('/generate', authenticate, checkUsageLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { type, topic, targetAudience, keywords, productName, features, benefits, platform, tone, blogType } = req.body;

    if (!type || !topic) {
      return res.status(400).json({ message: 'Content type and topic are required.' });
    }

    // Prepare content request
    const contentRequest = {
      type,
      topic,
      targetAudience,
      keywords,
      productName,
      features,
      benefits,
      platform,
      tone,
      blogType
    };

    // Generate content using AI
    const generatedText = await generateAIContent(contentRequest);
    const generationTime = Date.now() - startTime;

    // Create title
    const title = generateTitle(contentRequest);

    // Save content to database
    const content = new Content({
      user: req.user._id,
      title,
      content: generatedText,
      type,
      metadata: {
        topic,
        targetAudience,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
        platform,
        tone,
        blogType,
        productName,
        features: features ? features.split(',').map(f => f.trim()) : [],
        benefits: benefits ? benefits.split(',').map(b => b.trim()) : []
      },
      aiModel: 'gpt-3.5-turbo',
      generationTime
    });

    await content.save();

    // Update user usage
    await req.user.updateUsage(content.metrics.wordCount);

    // Log analytics
    await Analytics.create({
      user: req.user._id,
      event: 'content_generated',
      contentType: type,
      metadata: {
        wordCount: content.metrics.wordCount,
        generationTime,
        aiModel: 'gpt-3.5-turbo',
        platform,
        tone,
        success: true
      }
    });

    res.json({
      message: 'Content generated successfully',
      content: {
        id: content._id,
        title: content.title,
        content: content.content,
        type: content.type,
        metrics: content.metrics,
        createdAt: content.createdAt
      },
      usage: {
        current: req.user.usage.wordsGenerated + content.metrics.wordCount,
        limit: req.user.usage.wordsLimit,
        remaining: req.user.usage.wordsLimit === -1 ? -1 : Math.max(0, req.user.usage.wordsLimit - (req.user.usage.wordsGenerated + content.metrics.wordCount))
      }
    });
  } catch (error) {
    const generationTime = Date.now() - startTime;
    
    // Log failed generation
    await Analytics.create({
      user: req.user._id,
      event: 'content_generated',
      contentType: req.body.type,
      metadata: {
        generationTime,
        success: false,
        errorMessage: error.message
      }
    });

    console.error('Content generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate content',
      error: error.message 
    });
  }
});

// Get user's content
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { 'metadata.topic': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contents, total] = await Promise.all([
      Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content') // Exclude full content for list view
        .lean(),
      Content.countDocuments(query)
    ]);

    res.json({
      contents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error fetching content.' });
  }
});

// Get specific content
router.get('/:id', authenticate, async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error fetching content.' });
  }
});

// Update content
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, status, tags, isFavorite } = req.body;

    const updatedContent = await Content.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        ...(title && { title }),
        ...(content && { content }),
        ...(status && { status }),
        ...(tags && { tags }),
        ...(typeof isFavorite === 'boolean' && { isFavorite })
      },
      { new: true, runValidators: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    res.json({
      message: 'Content updated successfully',
      content: updatedContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error updating content.' });
  }
});

// Delete content
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const content = await Content.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found.' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error deleting content.' });
  }
});

// Get content statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const stats = await Content.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          totalWords: { $sum: '$metrics.wordCount' },
          avgWordsPerContent: { $avg: '$metrics.wordCount' },
          avgSEOScore: { $avg: '$metrics.seoScore' },
          contentByType: {
            $push: {
              type: '$type',
              wordCount: '$metrics.wordCount'
            }
          }
        }
      }
    ]);

    const typeStats = await Content.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalWords: { $sum: '$metrics.wordCount' },
          avgSEOScore: { $avg: '$metrics.seoScore' }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalContent: 0,
        totalWords: 0,
        avgWordsPerContent: 0,
        avgSEOScore: 0
      },
      byType: typeStats
    });
  } catch (error) {
    console.error('Get content stats error:', error);
    res.status(500).json({ message: 'Server error fetching content statistics.' });
  }
});

// Helper function to generate title
function generateTitle(request) {
  switch (request.type) {
    case 'seo-blog':
      const blogTypeText = request.blogType === 'humanized' ? 'Humanized SEO' : 'SEO';
      return `${request.topic} - ${blogTypeText} Blog Article`;
    case 'product-description':
      return `${request.productName || request.topic} - Product Description`;
    case 'ad-copy':
      return `${request.topic} - Complete ${request.platform || 'Ad'} Campaign Package`;
    case 'social-media':
      return `${request.topic} - ${request.platform || 'Social Media'} Post`;
    default:
      return `${request.topic} - Generated Content`;
  }
}

export default router;