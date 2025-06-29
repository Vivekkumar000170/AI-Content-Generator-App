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
      throw new Error('OpenAI API key is not configured for image generation.');
    }

    const imagePrompt = buildPosterBannerPrompt(config);
    const imageSize = getImageSize(config.size);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: imageSize,
      quality: "hd",
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
    console.error('Poster/Banner generation error:', error);
    throw error;
  }
};

const buildPosterBannerPrompt = (config: PosterBannerConfig): string => {
  const { type, topic, text, subtitle, callToAction, style, colorScheme, tone } = config;
  
  let basePrompt = `Create a professional ${type} design about "${topic}".`;
  
  // Add text elements
  if (text) {
    basePrompt += ` Main headline: "${text}".`;
  }
  if (subtitle) {
    basePrompt += ` Subtitle: "${subtitle}".`;
  }
  if (callToAction) {
    basePrompt += ` Call-to-action: "${callToAction}".`;
  }
  
  // Add style specifications
  basePrompt += ` Design style: ${style}.`;
  basePrompt += ` Color scheme: ${colorScheme}.`;
  basePrompt += ` Tone: ${tone || 'professional'}.`;
  
  // Add specific design requirements
  if (type === 'poster') {
    basePrompt += ` Create a vertical poster layout with bold typography, eye-catching visuals, clear hierarchy, and balanced composition. Include decorative elements and modern design principles.`;
  } else {
    basePrompt += ` Create a horizontal banner layout with prominent text, clean design, professional appearance, and optimized for digital display.`;
  }
  
  // Add technical specifications
  basePrompt += ` High resolution, print-ready quality, modern typography, professional layout, visually striking, commercial-grade design.`;
  
  // Style-specific additions
  switch (style) {
    case 'minimalist':
      basePrompt += ` Clean, simple, lots of white space, minimal elements, elegant typography.`;
      break;
    case 'modern':
      basePrompt += ` Contemporary design, sleek lines, modern fonts, trendy colors, sophisticated layout.`;
      break;
    case 'creative':
      basePrompt += ` Artistic elements, creative typography, unique composition, innovative design, expressive visuals.`;
      break;
    case 'corporate':
      basePrompt += ` Professional business style, corporate colors, formal typography, trustworthy appearance.`;
      break;
    case 'vintage':
      basePrompt += ` Retro design elements, vintage typography, classic color palette, nostalgic feel.`;
      break;
    case 'artistic':
      basePrompt += ` Creative artistic style, painterly effects, artistic typography, expressive design.`;
      break;
  }
  
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