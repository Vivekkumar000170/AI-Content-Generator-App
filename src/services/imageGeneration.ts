import OpenAI from 'openai';
import { ContentType } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface GeneratedImage {
  url: string;
  prompt: string;
  style: string;
}

export const generateImage = async (
  contentType: ContentType,
  topic: string,
  platform?: string,
  tone?: string
): Promise<GeneratedImage> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback image');
      return getFallbackImage(contentType, topic);
    }

    const imagePrompt = buildImagePrompt(contentType, topic, platform, tone);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: contentType === 'social-media' ? "1024x1024" : "1792x1024",
      quality: "standard",
      style: getImageStyle(contentType, tone)
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    return {
      url: imageUrl,
      prompt: imagePrompt,
      style: getImageStyle(contentType, tone)
    };
  } catch (error) {
    console.warn('Image generation failed, using fallback:', error);
    
    // Always return fallback image instead of throwing error
    return getFallbackImage(contentType, topic);
  }
};

const buildImagePrompt = (
  contentType: ContentType,
  topic: string,
  platform?: string,
  tone?: string
): string => {
  // Simplified and safer prompts to avoid DALL-E policy violations
  const cleanTopic = topic.replace(/[^\w\s]/gi, '').trim();
  
  switch (contentType) {
    case 'ad-copy':
      return `A professional marketing image featuring ${cleanTopic}. Modern, clean design with vibrant colors. Commercial photography style, high quality, professional lighting. No text or logos.`;
              
    case 'social-media':
      return `A social media friendly image about ${cleanTopic}. Bright, engaging, modern aesthetic. Clean composition, attractive colors, optimized for ${platform || 'social media'}. No text overlays.`;
              
    default:
      return `A professional image related to ${cleanTopic}. Clean, modern, high quality.`;
  }
};

const getImageStyle = (contentType: ContentType, tone?: string): 'vivid' | 'natural' => {
  if (contentType === 'social-media') return 'vivid';
  if (tone === 'casual' || tone === 'urgent') return 'vivid';
  return 'natural';
};

const getFallbackImage = (contentType: ContentType, topic: string): GeneratedImage => {
  // Curated Pexels images for different content types and topics
  const fallbackImages = {
    'ad-copy': {
      business: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technology: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      marketing: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      finance: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      health: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      education: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      food: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      travel: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      default: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'social-media': {
      business: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      lifestyle: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technology: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      fitness: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      food: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      travel: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      education: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      default: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  };

  const categoryImages = fallbackImages[contentType as keyof typeof fallbackImages];
  
  // Smart topic matching
  const topicLower = topic.toLowerCase();
  let selectedKey = 'default';
  
  for (const key of Object.keys(categoryImages)) {
    if (topicLower.includes(key) || key === 'default') {
      selectedKey = key;
      if (key !== 'default') break; // Use specific match if found
    }
  }
  
  return {
    url: categoryImages[selectedKey as keyof typeof categoryImages],
    prompt: `Professional stock image for ${topic}`,
    style: 'natural'
  };
};