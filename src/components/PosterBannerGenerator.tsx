import React, { useState } from 'react';
import { Image, Download, RefreshCw, Sparkles, AlertCircle, Palette, Type, Layout, Copy } from 'lucide-react';
import { generatePosterBanner, PosterBannerConfig, posterTemplates, bannerTemplates } from '../services/posterGenerator';

const PosterBannerGenerator = () => {
  const [config, setConfig] = useState<PosterBannerConfig>({
    type: 'poster',
    topic: '',
    text: '',
    subtitle: '',
    callToAction: '',
    size: 'portrait',
    style: 'modern',
    colorScheme: 'professional blue and white',
    tone: 'professional'
  });
  
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigChange = (field: keyof PosterBannerConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleTypeChange = (type: 'poster' | 'banner') => {
    setConfig(prev => ({
      ...prev,
      type,
      size: type === 'poster' ? 'portrait' : 'landscape'
    }));
  };

  const applyTemplate = (templateKey: string) => {
    const templates = config.type === 'poster' ? posterTemplates : bannerTemplates;
    const template = templates[templateKey as keyof typeof templates];
    
    if (template) {
      setConfig(prev => ({
        ...prev,
        style: template.style,
        colorScheme: template.colorScheme,
        text: template.defaultText,
        subtitle: template.defaultSubtitle,
        callToAction: template.defaultCTA
      }));
    }
  };

  const handleGenerate = async () => {
    if (!config.topic.trim()) {
      setError('Please enter a topic for your design');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generatePosterBanner(config);
      setGeneratedImage(result);
    } catch (error: any) {
      console.error('Error generating poster/banner:', error);
      setError(error.message || 'Failed to generate design. Please try again.');
    }
    
    setIsGenerating(false);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await fetch(generatedImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.type}_${config.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const styles = ['minimalist', 'modern', 'creative', 'corporate', 'vintage', 'artistic'];
  const colorSchemes = [
    'professional blue and white',
    'vibrant and energetic',
    'elegant black and gold',
    'fresh green and white',
    'bold red and yellow',
    'soft pastel colors',
    'monochrome black and white',
    'warm orange and brown',
    'cool purple and silver',
    'bright rainbow colors'
  ];

  return (
    <section className="relative z-10 py-20" id="poster-banner-generator">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Poster & Banner
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Generator
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Create stunning posters and banners with AI. Perfect for events, promotions, announcements, and marketing campaigns.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Configuration Panel */}
          <div className="space-y-8">
            {/* Type Selection */}
            <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Layout className="w-6 h-6 text-purple-400" />
                <span>Design Type</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleTypeChange('poster')}
                  className={`p-6 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    config.type === 'poster'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-16 bg-gradient-to-b from-purple-500 to-pink-500 rounded-lg mx-auto mb-3 shadow-lg"></div>
                    <h4 className="font-semibold text-white">Poster</h4>
                    <p className="text-sm text-gray-400">Vertical layout</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleTypeChange('banner')}
                  className={`p-6 border-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                    config.type === 'banner'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-3 shadow-lg"></div>
                    <h4 className="font-semibold text-white">Banner</h4>
                    <p className="text-sm text-gray-400">Horizontal layout</p>
                  </div>
                </button>
              </div>

              {/* Quick Templates */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(config.type === 'poster' ? posterTemplates : bannerTemplates).map((template) => (
                    <button
                      key={template}
                      onClick={() => applyTemplate(template)}
                      className="px-4 py-2 bg-gray-700/50 backdrop-blur-xl hover:bg-gray-600/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200 capitalize border border-white/5 hover:scale-105"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Topic / Subject *
                </label>
                <input
                  type="text"
                  value={config.topic}
                  onChange={(e) => handleConfigChange('topic', e.target.value)}
                  placeholder="e.g., Summer Sale, Conference 2024, Product Launch"
                  className="w-full px-4 py-4 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Type className="w-6 h-6 text-blue-400" />
                <span>Text Content</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={config.text}
                    onChange={(e) => handleConfigChange('text', e.target.value)}
                    placeholder="Enter main headline"
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                    placeholder="Enter subtitle"
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Call to Action
                  </label>
                  <input
                    type="text"
                    value={config.callToAction}
                    onChange={(e) => handleConfigChange('callToAction', e.target.value)}
                    placeholder="e.g., Shop Now, Register Today, Learn More"
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Design Options */}
            <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                <Palette className="w-6 h-6 text-green-400" />
                <span>Design Options</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style
                  </label>
                  <select
                    value={config.style}
                    onChange={(e) => handleConfigChange('style', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                  >
                    {styles.map(style => (
                      <option key={style} value={style} className="capitalize">
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color Scheme
                  </label>
                  <select
                    value={config.colorScheme}
                    onChange={(e) => handleConfigChange('colorScheme', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                  >
                    {colorSchemes.map(scheme => (
                      <option key={scheme} value={scheme} className="capitalize">
                        {scheme}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={config.tone}
                    onChange={(e) => handleConfigChange('tone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="energetic">Energetic</option>
                    <option value="elegant">Elegant</option>
                    <option value="playful">Playful</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div>
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={!config.topic.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 hover:scale-105 backdrop-blur-xl"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Generating AI Design...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate AI {config.type}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {generatedImage ? (
              <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-b border-white/10 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image className="w-5 h-5 text-purple-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">Generated {config.type}</h3>
                        <p className="text-sm text-gray-400">AI-created design ready for use</p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600/50 backdrop-blur-xl hover:bg-purple-700/50 rounded-lg text-white transition-all duration-300 hover:scale-105 border border-white/10"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <img
                      src={generatedImage.url}
                      alt={`Generated ${config.type} for ${config.topic}`}
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-white text-sm font-medium capitalize">{config.type}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gray-700/30 backdrop-blur-xl rounded-lg border border-white/5">
                    <p className="text-xs text-gray-400 mb-2">
                      <strong>Style:</strong> {config.style} • <strong>Colors:</strong> {config.colorScheme}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>AI Prompt:</strong> {generatedImage.prompt.substring(0, 150)}...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 backdrop-blur-xl border-2 border-dashed border-gray-600 rounded-2xl p-16 text-center">
                <div className="relative mb-6">
                  <Image className="w-16 h-16 text-gray-500 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-3">Ready to Create</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Configure your {config.type} settings and click "Generate AI {config.type}" to create 
                  a professional design powered by artificial intelligence.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PosterBannerGenerator;