export type ContentType = 'seo-blog' | 'product-description' | 'ad-copy' | 'social-media';

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