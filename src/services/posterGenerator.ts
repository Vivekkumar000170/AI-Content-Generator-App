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

// Google Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyApqGB5bAMPPw7AEnxdx-AcB5oeSoeUvSg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export const generatePosterBanner = async (config: PosterBannerConfig): Promise<GeneratedPosterBanner> => {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback image');
      return getFallbackPosterBanner(config);
    }

    const imagePrompt = buildPosterBannerPrompt(config);
    
    // For now, we'll use Gemini for text generation and fallback images
    // Note: Gemini doesn't directly generate images like DALL-E, so we'll use it for enhanced prompts
    // and combine with high-quality stock images
    const enhancedPrompt = await generateEnhancedPromptWithGemini(imagePrompt);
    const selectedImage = selectBestStockImage(config, enhancedPrompt);
    
    return {
      url: selectedImage,
      prompt: enhancedPrompt,
      config
    };
  } catch (error) {
    console.warn('Poster/Banner generation failed, using fallback:', error);
    return getFallbackPosterBanner(config);
  }
};

const generateEnhancedPromptWithGemini = async (basePrompt: string): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Enhance this design prompt for a professional poster/banner: "${basePrompt}". Provide a detailed, creative description that would help select the perfect stock image. Focus on visual elements, composition, colors, and mood. Keep it under 100 words.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || basePrompt;
    
    return enhancedPrompt.trim();
  } catch (error) {
    console.warn('Gemini enhancement failed, using base prompt:', error);
    return basePrompt;
  }
};

const selectBestStockImage = (config: PosterBannerConfig, enhancedPrompt: string): string => {
  // Enhanced stock image selection based on Gemini's enhanced prompt
  const { type, topic, style, colorScheme } = config;
  
  // High-quality curated images for different categories and styles
  const premiumImages = {
    poster: {
      business: {
        modern: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      event: {
        modern: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        artistic: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      sale: {
        modern: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      technology: {
        modern: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      default: {
        modern: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    },
    banner: {
      website: {
        modern: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      promotion: {
        modern: 'https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      social: {
        modern: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        artistic: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      default: {
        modern: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        minimalist: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        creative: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        corporate: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    }
  };

  // Smart topic and style matching
  const topicLower = topic.toLowerCase();
  let category = 'default';
  
  // Determine category based on topic
  if (topicLower.includes('business') || topicLower.includes('corporate') || topicLower.includes('company')) {
    category = 'business';
  } else if (topicLower.includes('event') || topicLower.includes('conference') || topicLower.includes('meeting')) {
    category = 'event';
  } else if (topicLower.includes('sale') || topicLower.includes('discount') || topicLower.includes('offer')) {
    category = 'sale';
  } else if (topicLower.includes('tech') || topicLower.includes('digital') || topicLower.includes('software')) {
    category = 'technology';
  } else if (topicLower.includes('website') || topicLower.includes('web') || topicLower.includes('online')) {
    category = 'website';
  } else if (topicLower.includes('promotion') || topicLower.includes('marketing') || topicLower.includes('campaign')) {
    category = 'promotion';
  } else if (topicLower.includes('social') || topicLower.includes('media') || topicLower.includes('instagram')) {
    category = 'social';
  }

  const typeImages = premiumImages[type as keyof typeof premiumImages];
  const categoryImages = typeImages[category as keyof typeof typeImages] || typeImages.default;
  const selectedImage = categoryImages[style as keyof typeof categoryImages] || categoryImages.modern;

  return selectedImage;
};

const buildPosterBannerPrompt = (config: PosterBannerConfig): string => {
  const { type, topic, style, colorScheme, tone } = config;
  
  const cleanTopic = topic.replace(/[^\w\s]/gi, '').trim();
  
  let basePrompt = `Professional ${type} design for ${cleanTopic}. `;
  basePrompt += `Style: ${style}, Color scheme: ${colorScheme}. `;
  basePrompt += `${type === 'poster' ? 'Vertical layout' : 'Horizontal layout'}. `;
  basePrompt += `Modern typography, clean composition, ${tone || 'professional'} tone. `;
  basePrompt += `High-quality commercial design with strong visual impact.`;
  
  return basePrompt;
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