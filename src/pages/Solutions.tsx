import React from 'react';
import { FileText, Package, Megaphone, Share2, Zap, Target, TrendingUp, CheckCircle } from 'lucide-react';

const solutions = [
  {
    icon: FileText,
    title: 'SEO Blog Content',
    description: 'AI-powered blog articles optimized for search engines and user engagement',
    features: ['Keyword optimization', 'SEO-friendly structure', 'Engaging headlines', 'Meta descriptions'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Package,
    title: 'Product Descriptions',
    description: 'Compelling product descriptions that convert browsers into buyers',
    features: ['Benefit-focused copy', 'Feature highlights', 'Call-to-action', 'Brand voice consistency'],
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Megaphone,
    title: 'Ad Copy Creation',
    description: 'High-converting ad copy for Google, Facebook, and Instagram campaigns',
    features: ['Platform optimization', 'A/B test variations', 'Conversion-focused', 'Brand alignment'],
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: Share2,
    title: 'Social Media Posts',
    description: 'Engaging social media content that drives interaction and builds community',
    features: ['Platform-specific content', 'Hashtag optimization', 'Engagement hooks', 'Visual suggestions'],
    gradient: 'from-purple-500 to-pink-500'
  }
];

const Solutions = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Content Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Transform your content strategy with our comprehensive suite of AI-driven solutions. 
            From SEO blogs to social media posts, we've got you covered.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${solution.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{solution.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{solution.description}</p>
                <ul className="space-y-3">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Content?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using our AI solutions to create compelling content that drives results.
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solutions;