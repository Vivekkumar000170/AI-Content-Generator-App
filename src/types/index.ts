export type ContentType = 'seo-blog' | 'product-description' | 'ad-copy' | 'social-media' | 'poster' | 'banner';

export interface ContentRequest {
  type: ContentType;
  topic: string;
  targetAudience?: string;
  keywords?: string;
  productName?: string;
  features?: string;
  benefits?: string;
  platform?: string;
  tone?: string;
  blogType?: 'ai-written' | 'humanized';
  // Poster/Banner specific fields
  size?: string;
  style?: string;
  colorScheme?: string;
  text?: string;
  subtitle?: string;
  callToAction?: string;
}

export interface GeneratedContent {
  title: string;
  content: string;
  type: ContentType;
  timestamp: Date;
  image?: {
    url: string;
    prompt: string;
    style: string;
  };
}