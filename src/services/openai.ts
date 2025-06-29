import OpenAI from 'openai';
import { ContentRequest } from '../types';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

export const generateAIContent = async (request: ContentRequest): Promise<string> => {
  try {
    const prompt = buildPrompt(request);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional content writer and marketing expert. Create high-quality, engaging content that is well-structured and optimized for the specified purpose. Always maintain a professional yet friendly tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate content. Please try again.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content. Please check your API key and try again.');
  }
};

const buildPrompt = (request: ContentRequest): string => {
  switch (request.type) {
    case 'seo-blog':
      return `Write a comprehensive SEO-optimized blog article about "${request.topic}".
      
      Requirements:
      - Target audience: ${request.targetAudience || 'general audience'}
      - Include these keywords naturally: ${request.keywords || 'relevant keywords'}
      - Structure with clear headings (H1, H2, H3)
      - Include introduction, main content sections, and conclusion
      - Aim for 800-1200 words
      - Make it engaging and informative
      - Include actionable tips and insights
      
      Format the response with proper markdown headings and structure.`;

    case 'product-description':
      return `Write a compelling product description for "${request.productName || request.topic}".
      
      Product details:
      - Key features: ${request.features || 'high-quality, user-friendly, reliable'}
      - Main benefits: ${request.benefits || 'saves time, increases efficiency, delivers results'}
      
      Requirements:
      - Highlight unique selling points
      - Focus on benefits over features
      - Include emotional appeal
      - Add a strong call-to-action
      - Keep it concise but persuasive (200-400 words)
      - Use bullet points for features/benefits`;

    case 'ad-copy':
      return `Create attention-grabbing ad copy for "${request.topic}" on ${request.platform || 'Google Ads'}.
      
      Requirements:
      - Tone: ${request.tone || 'professional'}
      - Include a compelling headline
      - Focus on benefits and value proposition
      - Include a strong call-to-action
      - Keep it concise and punchy
      - Make it platform-appropriate
      - Use persuasive language that converts`;

    case 'social-media':
      return `Create an engaging social media post about "${request.topic}" for ${request.platform || 'LinkedIn'}.
      
      Requirements:
      - Target audience: ${request.targetAudience || 'professionals'}
      - Platform: ${request.platform || 'LinkedIn'}
      - Include relevant hashtags
      - Add a clear call-to-action
      - Make it conversational and engaging
      - Encourage interaction (comments, shares)
      - Keep it platform-appropriate length
      - Include emojis if suitable for the platform`;

    default:
      return `Create professional content about "${request.topic}".`;
  }
};