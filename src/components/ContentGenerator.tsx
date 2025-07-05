import React, { useState, useEffect } from 'react';
import { FileText, Package, Megaphone, Share2, Copy, RefreshCw, Sparkles, AlertCircle, Bot, Zap, ChevronDown, Image, Download, Palette, Lock } from 'lucide-react';
import { ContentType, ContentRequest, GeneratedContent } from '../types';
import { generateContent } from '../utils/contentTemplates';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const contentTypes = [
  {
    id: 'seo-blog' as ContentType,
    title: 'SEO Blog',
    description: 'AI-powered blog articles optimized for search engines',
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'product-description' as ContentType,
    title: 'Product Description',
    description: 'Compelling product descriptions with AI-generated features',
    icon: Package,
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'ad-copy' as ContentType,
    title: 'Ad Copy',
    description: 'AI-crafted ad copy for Google/Facebook/Instagram with images',
    icon: Megaphone,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'social-media' as ContentType,
    title: 'Social Media Post',
    description: 'Engaging AI-generated posts for Instagram, LinkedIn with images',
    icon: Share2,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'poster' as ContentType,
    title: 'AI Poster',
    description: 'Professional posters for events, promotions, and announcements',
    icon: Palette,
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'banner' as ContentType,
    title: 'AI Banner',
    description: 'Eye-catching banners for websites, social media, and marketing',
    icon: Image,
    gradient: 'from-indigo-500 to-purple-500'
  }
];

const ContentGenerator = () => {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ContentType>('seo-blog');
  const [blogType, setBlogType] = useState<'ai-written' | 'humanized'>('ai-written');
  const [formData, setFormData] = useState<ContentRequest>({
    type: 'seo-blog',
    topic: '',
    targetAudience: '',
    keywords: '',
    productName: '',
    features: '',
    benefits: '',
    platform: 'LinkedIn',
    tone: 'professional'
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for user usage updates
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent) => {
      if (user) {
        updateUser({ 
          usage: { 
            ...user.usage, 
            wordsGenerated: event.detail.wordsGenerated 
          } 
        });
      }
    };

    window.addEventListener('userUsageUpdated', handleUsageUpdate as EventListener);
    return () => {
      window.removeEventListener('userUsageUpdated', handleUsageUpdate as EventListener);
    };
  }, [user, updateUser]);

  const handleTypeChange = (type: ContentType) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, type }));
    setGeneratedContent(null);
    setError(null);
  };

  const handleInputChange = (field: keyof ContentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkUsageLimit = (estimatedWordCount: number = 500): boolean => {
    if (!user) return false;
    if (user.plan === 'enterprise') return true;
    if (user.usage.wordsLimit === -1) return true;
    
    return (user.usage.wordsGenerated + estimatedWordCount) <= user.usage.wordsLimit;
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!user?.isEmailVerified) {
      setError('Please verify your email address before generating content.');
      return;
    }

    if (!formData.topic.trim()) return;

    // Check usage limits
    const estimatedWordCount = selectedType === 'ad-copy' ? 1000 : 500;
    if (!checkUsageLimit(estimatedWordCount)) {
      setError(`Usage limit exceeded. You have ${Math.max(0, user!.usage.wordsLimit - user!.usage.wordsGenerated)} words remaining.`);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const content = await generateContent({ ...formData, blogType });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content. Please try again or check your internet connection.');
    }
    
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!generatedContent) return;
    
    try {
      await navigator.clipboard.writeText(generatedContent.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedContent?.image) return;
    
    try {
      const response = await fetch(generatedContent.image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_image.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const renderFormFields = () => {
    const selectedTypeData = contentTypes.find(type => type.id === selectedType);
    
    // For poster and banner types, redirect to dedicated generator
    if (selectedType === 'poster' || selectedType === 'banner') {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            Dedicated {selectedType} Generator
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {selectedType === 'poster' ? 'Posters' : 'Banners'} have their own specialized generator with advanced design options, templates, and customization features.
          </p>
          <button
            onClick={() => {
              // Scroll to poster/banner generator section
              const element = document.getElementById('poster-banner-generator');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Go to {selectedType} Generator
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Topic / Subject *
          </label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder={`Enter your ${selectedTypeData?.title.toLowerCase()} topic...`}
            className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
          />
        </div>

        {selectedType === 'seo-blog' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Blog Type
              </label>
              <div className="relative">
                <select
                  value={blogType}
                  onChange={(e) => setBlogType(e.target.value as 'ai-written' | 'humanized')}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white appearance-none cursor-pointer"
                >
                  <option value="ai-written">AI Written Blog</option>
                  <option value="humanized">Humanized Blog for Google Ranking</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {blogType === 'humanized' 
                  ? 'Optimized for better Google ranking with human-like writing patterns'
                  : 'Standard AI-generated blog content'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., small business owners, marketers"
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="e.g., digital marketing, SEO, content strategy"
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              />
            </div>
          </>
        )}

        {selectedType === 'product-description' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Product Name
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                placeholder="Enter product name"
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Key Features (comma-separated)
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="e.g., durable materials, easy setup, 24/7 support"
                rows={3}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Benefits (comma-separated)
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                placeholder="e.g., saves time, increases productivity, reduces costs"
                rows={3}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 resize-none"
              />
            </div>
          </>
        )}

        {selectedType === 'ad-copy' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tone
              </label>
              <select
                value={formData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Image className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">AI Image Generation</span>
              </div>
              <p className="text-sm text-gray-300">
                A custom image will be generated automatically for your ad campaign to enhance visual appeal and engagement.
              </p>
            </div>
          </>
        )}

        {selectedType === 'social-media' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="e.g., professionals, entrepreneurs, marketers"
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              />
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Image className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">AI Image Generation</span>
              </div>
              <p className="text-sm text-gray-300">
                A custom image will be generated automatically for your social media post to maximize engagement and visual impact.
              </p>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <section className="relative z-10 py-20" id="content-generator">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Create Content with
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced AI Technology
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose your content type and let our AI generate professional, engaging content with custom images in seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Section */}
            <div className="space-y-8">
              {/* AI Status Badge */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Bot className="w-8 h-8 text-blue-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">AI Engine Status</h3>
                    <p className="text-sm text-gray-400">OpenAI GPT-3.5 + DALL-E 3 • Ready for content & image generation</p>
                  </div>
                  <div className="ml-auto">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Authentication Notice */}
              {!isAuthenticated && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <Lock className="w-8 h-8 text-orange-400" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Sign Up Required</h3>
                      <p className="text-sm text-gray-400">Create a free account to start generating AI content</p>
                    </div>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="ml-auto bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
                    >
                      Sign Up Free
                    </button>
                  </div>
                </div>
              )}

              {/* Email Verification Notice */}
              {isAuthenticated && user && !user.isEmailVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email Verification Required</h3>
                      <p className="text-sm text-gray-400">Please verify your email address to start generating content</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Limit Warning */}
              {isAuthenticated && user && user.isEmailVerified && user.plan !== 'enterprise' && (
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Usage This Month</h3>
                    <span className="text-sm text-gray-400">
                      {user.usage.wordsGenerated.toLocaleString()} / {
                        user.usage.wordsLimit === -1 
                          ? 'Unlimited' 
                          : user.usage.wordsLimit.toLocaleString()
                      } words
                    </span>
                  </div>
                  {user.usage.wordsLimit !== -1 && (
                    <div className="w-full bg-gray-700/50 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((user.usage.wordsGenerated / user.usage.wordsLimit) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {user.usage.wordsLimit === -1 
                      ? 'Unlimited words remaining'
                      : `${Math.max(0, user.usage.wordsLimit - user.usage.wordsGenerated)} words remaining`
                    }
                  </p>
                </div>
              )}

              {/* Content Type Selection */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Choose Content Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeChange(type.id)}
                        className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:scale-105 ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${type.gradient} shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">{type.title}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">{type.description}</p>
                            {(type.id === 'ad-copy' || type.id === 'social-media' || type.id === 'poster' || type.id === 'banner') && (
                              <div className="flex items-center space-x-1 mt-2">
                                <Image className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-400 font-medium">+ AI Image</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-6">Content Details</h3>
                {renderFormFields()}
                
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                )}
                
                {selectedType !== 'poster' && selectedType !== 'banner' && (
                  <button
                    onClick={handleGenerate}
                    disabled={!formData.topic.trim() || isGenerating || !isAuthenticated || (user && !user.isEmailVerified)}
                    className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-600 py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Generating with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Generate AI Content{(selectedType === 'ad-copy' || selectedType === 'social-media') ? ' + Image' : ''}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              {generatedContent ? (
                <>
                  {/* Generated Image */}
                  {generatedContent.image && (
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Image className="w-5 h-5 text-purple-400" />
                            <div>
                              <h3 className="text-lg font-semibold text-white">AI Generated Image</h3>
                              <p className="text-sm text-gray-400">Custom visual for your {selectedType}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleDownloadImage}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-all duration-300"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Download</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <img
                          src={generatedContent.image.url}
                          alt={generatedContent.image.prompt}
                          className="w-full rounded-lg shadow-lg"
                        />
                        <p className="text-xs text-gray-500 mt-3">
                          <strong>Prompt:</strong> {generatedContent.image.prompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Generated Content */}
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bot className="w-6 h-6 text-blue-400" />
                          <div>
                            <h3 className="text-lg font-semibold text-white">AI Generated Content</h3>
                            <p className="text-sm text-gray-400">
                              {selectedType === 'seo-blog' && blogType === 'humanized' 
                                ? 'Humanized for Google Ranking' 
                                : 'Powered by OpenAI GPT-3.5'
                              }
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleCopy}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            copied
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                          }`}
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans leading-relaxed">
                          {generatedContent.content}
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-2xl p-16 text-center">
                  <div className="relative mb-6">
                    <Sparkles className="w-16 h-16 text-gray-500 mx-auto" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-3">Ready to Generate AI Content</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {!isAuthenticated 
                      ? 'Sign up for free to start generating high-quality content with advanced AI technology.'
                      : user && !user.isEmailVerified
                      ? 'Please verify your email address to start generating content.'
                      : `Fill in the details and click "Generate AI Content" to create high-quality content 
                        ${(selectedType === 'ad-copy' || selectedType === 'social-media') ? ' with custom images ' : ' '}
                        powered by artificial intelligence.`
                    }
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      Start Free Trial
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </>
  );
};

export default ContentGenerator;