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
          content: getSystemPrompt(request)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: request.blogType === 'humanized' ? 0.8 : 0.7,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate content. Please try again.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate content. Please check your API key and try again.');
  }
};

const getSystemPrompt = (request: ContentRequest): string => {
  if (request.type === 'seo-blog' && request.blogType === 'humanized') {
    return `You are a professional content writer who specializes in creating human-like, engaging blog content that ranks well on Google. Your writing style should be:
    - Conversational and personal (use "I", "you", "we")
    - Include personal anecdotes and experiences
    - Use varied sentence lengths and structures
    - Include rhetorical questions and direct reader engagement
    - Avoid overly formal or robotic language
    - Include natural transitions and flow
    - Use contractions and casual language where appropriate
    - Add personality and opinion to make it feel authentic
    - Structure content with natural, human-like headings
    - Include real-world examples and scenarios`;
  }
  
  return "You are a professional content writer and marketing expert. Create high-quality, engaging content that is well-structured and optimized for the specified purpose. Always maintain a professional yet friendly tone.";
};

const buildPrompt = (request: ContentRequest): string => {
  switch (request.type) {
    case 'seo-blog':
      if (request.blogType === 'humanized') {
        return `Write a humanized, conversational blog article about "${request.topic}" that feels like it was written by a real person with experience in this field.
        
        Requirements:
        - Target audience: ${request.targetAudience || 'general audience'}
        - Include these keywords naturally: ${request.keywords || 'relevant keywords'}
        - Write in first person where appropriate
        - Include personal insights, experiences, or anecdotes
        - Use conversational language and contractions
        - Ask rhetorical questions to engage readers
        - Include varied sentence structures (short and long)
        - Add personality and authentic voice
        - Structure with natural, engaging headings
        - Aim for 800-1200 words
        - Make it feel like advice from a trusted expert
        
        The tone should be helpful, authentic, and engaging - like talking to a knowledgeable friend.`;
      } else {
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
      }

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