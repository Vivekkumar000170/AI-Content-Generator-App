import { ContentRequest, GeneratedContent } from '../types';
import { generateAIContent } from '../services/openai';

export const generateContent = async (request: ContentRequest): Promise<GeneratedContent> => {
  try {
    const content = await generateAIContent(request);
    
    // Generate appropriate title based on content type
    const title = generateTitle(request);
    
    return {
      title,
      content,
      type: request.type,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Content generation error:', error);
    
    // Fallback to template-based generation if API fails
    return generateFallbackContent(request);
  }
};

const generateTitle = (request: ContentRequest): string => {
  switch (request.type) {
    case 'seo-blog':
      return `${request.topic} - SEO Blog Article`;
    case 'product-description':
      return `${request.productName || request.topic} - Product Description`;
    case 'ad-copy':
      return `${request.topic} - ${request.platform || 'Ad'} Copy`;
    case 'social-media':
      return `${request.topic} - ${request.platform || 'Social Media'} Post`;
    default:
      return `${request.topic} - Generated Content`;
  }
};

// Fallback content generation (original template system)
const generateFallbackContent = (request: ContentRequest): GeneratedContent => {
  const title = generateTitle(request);
  
  let content = '';
  
  switch (request.type) {
    case 'seo-blog':
      content = `# ${request.topic}: A Comprehensive Guide

## Introduction

Understanding ${request.topic} is essential in today's competitive landscape. This guide provides valuable insights and actionable strategies.

## Key Points

- Important aspect 1 of ${request.topic}
- Critical consideration 2
- Best practices and recommendations

## Conclusion

${request.topic} offers significant opportunities when approached strategically. Implement these insights to achieve better results.`;
      break;
      
    case 'product-description':
      content = `# ${request.productName || request.topic}

**Transform your experience with our premium solution.**

## Key Features
${request.features ? request.features.split(',').map(f => `• ${f.trim()}`).join('\n') : '• Premium quality\n• User-friendly design\n• Reliable performance'}

## Benefits
${request.benefits ? request.benefits.split(',').map(b => `✓ ${b.trim()}`).join('\n') : '✓ Saves time\n✓ Increases productivity\n✓ Delivers results'}

**Ready to get started? Contact us today!**`;
      break;
      
    case 'ad-copy':
      content = `🚀 Discover ${request.topic}!

Transform your approach with our proven solution.

✅ Immediate results
✅ Expert support  
✅ Risk-free trial

Ready to get started?
👆 Click to learn more!`;
      break;
      
    case 'social-media':
      content = `💡 Let's talk about ${request.topic}!

As ${request.targetAudience || 'professionals'}, we know how important it is to stay ahead.

Key insights:
🔹 Strategic approach matters
🔹 Consistency drives results
🔹 Focus on value creation

What's your experience? Share in the comments! 👇

#${request.topic.replace(/\s+/g, '')} #Business #Growth`;
      break;
  }
  
  return {
    title,
    content,
    type: request.type,
    timestamp: new Date()
  };
};