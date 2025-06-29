import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface PosterBannerConfig {
  type: 'poster' | 'banner';
  topic: string;
  text?: string;
  subtitle?: string;
  callToAction?: string;
  size: string;
  style: string;
  colorScheme: string;
  tone?: string;
}

export interface GeneratedPosterBanner {
  url: string;
  prompt: string;
  config: PosterBannerConfig;
}

export const generatePosterBanner = async (config: PosterBannerConfig): Promise<GeneratedPosterBanner> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback image');
      return getFallbackPosterBanner(config);
    }

    const imagePrompt = buildPosterBannerPrompt(config);
    const imageSize = getImageSize(config.size);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: imageSize,
      quality: "standard", // Changed from "hd" to "standard" to avoid quota issues
      style: config.style === 'artistic' || config.style === 'creative' ? 'vivid' : 'natural'
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL received from OpenAI');
    }

    return {
      url: imageUrl,
      prompt: imagePrompt,
      config
    };
  } catch (error) {
    console.warn('Poster/Banner generation failed, using fallback:', error);
    return getFallbackPosterBanner(config);
  }
};

const buildPosterBannerPrompt = (config: PosterBannerConfig): string => {
  const { type, topic, style, colorScheme, tone } = config;
  
  // Simplified and safer prompt to avoid policy violations
  const cleanTopic = topic.replace(/[^\w\s]/gi, '').trim();
  
  let basePrompt = `Create a professional ${type} design about ${cleanTopic}. `;
  basePrompt += `Style: ${style}. Color scheme: ${colorScheme}. `;
  basePrompt += `${type === 'poster' ? 'Vertical layout' : 'Horizontal layout'}. `;
  basePrompt += `Modern typography, clean design, professional appearance. `;
  basePrompt += `High quality, commercial-grade design. No text overlays or specific words.`;
  
  return basePrompt;
};

const getImageSize = (size: string): "1024x1024" | "1792x1024" | "1024x1792" => {
  switch (size) {
    case 'square':
      return "1024x1024";
    case 'landscape':
    case 'banner':
      return "1792x1024";
    case 'portrait':
    case 'poster':
      return "1024x1792";
    default:
      return "1024x1792";
  }
};

const getFallbackPosterBanner = (config: PosterBannerConfig): GeneratedPosterBanner => {
  // Fallback images for posters and banners
  const fallbackImages = {
    poster: {
      event: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      business: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      sale: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      announcement: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      default: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    banner: {
      website: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      promotion: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      social: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      default: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
  };

  const categoryImages = fallbackImages[config.type];
  const topicLower = config.topic.toLowerCase();
  
  let selectedKey = 'default';
  for (const key of Object.keys(categoryImages)) {
    if (topicLower.includes(key) || key === 'default') {
      selectedKey = key;
      if (key !== 'default') break;
    }
  }

  return {
    url: categoryImages[selectedKey as keyof typeof categoryImages],
    prompt: `Professional ${config.type} design for ${config.topic}`,
    config
  };
};

// Predefined templates for quick generation
export const posterTemplates = {
  event: {
    style: 'modern',
    colorScheme: 'vibrant and energetic',
    defaultText: 'Join Us for an Amazing Event',
    defaultSubtitle: 'Don\'t miss this incredible opportunity',
    defaultCTA: 'Register Now'
  },
  business: {
    style: 'corporate',
    colorScheme: 'professional blue and white',
    defaultText: 'Grow Your Business',
    defaultSubtitle: 'Professional solutions for modern challenges',
    defaultCTA: 'Get Started'
  },
  sale: {
    style: 'creative',
    colorScheme: 'bold red and yellow',
    defaultText: 'Special Offer',
    defaultSubtitle: 'Limited time only',
    defaultCTA: 'Shop Now'
  },
  announcement: {
    style: 'minimalist',
    colorScheme: 'clean black and white',
    defaultText: 'Important Announcement',
    defaultSubtitle: 'Stay informed with the latest updates',
    defaultCTA: 'Learn More'
  }
};

export const bannerTemplates = {
  website: {
    style: 'modern',
    colorScheme: 'brand colors with gradient',
    defaultText: 'Welcome to Our Website',
    defaultSubtitle: 'Discover amazing products and services',
    defaultCTA: 'Explore Now'
  },
  promotion: {
    style: 'creative',
    colorScheme: 'bright and attention-grabbing',
    defaultText: 'Special Promotion',
    defaultSubtitle: 'Save big on selected items',
    defaultCTA: 'Shop Sale'
  },
  social: {
    style: 'artistic',
    colorScheme: 'trendy and social media friendly',
    defaultText: 'Follow Us',
    defaultSubtitle: 'Stay connected for updates',
    defaultCTA: 'Follow Now'
  }
};