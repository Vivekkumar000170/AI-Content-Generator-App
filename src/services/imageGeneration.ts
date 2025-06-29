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
      throw new Error('OpenAI API key is not configured for image generation.');
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
    console.error('Image generation error:', error);
    
    // Return fallback image from Pexels
    return getFallbackImage(contentType, topic);
  }
};

const buildImagePrompt = (
  contentType: ContentType,
  topic: string,
  platform?: string,
  tone?: string
): string => {
  const baseStyle = "professional, high-quality, modern design";
  
  switch (contentType) {
    case 'ad-copy':
      return `Create a ${tone || 'professional'} advertising image for ${topic}. 
              Style: ${baseStyle}, commercial photography, clean composition, 
              eye-catching visuals, suitable for ${platform || 'digital advertising'}.
              Include subtle branding elements, attractive color scheme, 
              and compelling visual hierarchy. No text overlays.`;
              
    case 'social-media':
      const platformStyle = platform === 'Instagram' 
        ? 'vibrant, engaging, lifestyle-focused' 
        : 'professional, business-oriented, clean';
        
      return `Create a ${platformStyle} social media image about ${topic}. 
              Style: ${baseStyle}, ${platformStyle}, optimized for ${platform || 'social media'}.
              Engaging composition, modern aesthetic, shareable quality.
              Perfect for social media engagement. No text overlays.`;
              
    default:
      return `Create a professional image related to ${topic}. 
              Style: ${baseStyle}, clean and modern aesthetic.`;
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
      default: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    'social-media': {
      business: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      lifestyle: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technology: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      default: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  };

  const categoryImages = fallbackImages[contentType as keyof typeof fallbackImages];
  const topicKey = Object.keys(categoryImages).find(key => 
    topic.toLowerCase().includes(key)
  ) || 'default';
  
  return {
    url: categoryImages[topicKey as keyof typeof categoryImages],
    prompt: `Fallback image for ${topic}`,
    style: 'natural'
  };
};