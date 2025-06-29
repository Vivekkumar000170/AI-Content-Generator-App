import React from 'react';
import { Brain, Zap, Shield, Globe, Cpu, Network, Clock, Users, Award, Target } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Advanced AI Models',
    description: 'Powered by cutting-edge GPT technology for intelligent content generation',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Generate high-quality content in seconds, not hours',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption for your data',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description: 'Create content in 50+ languages with native-level fluency',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Cpu,
    title: 'Smart Optimization',
    description: 'AI-powered SEO optimization for maximum reach and engagement',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Network,
    title: 'API Integration',
    description: 'Seamlessly integrate with your existing workflow and tools',
    color: 'from-teal-500 to-cyan-500'
  }
];

const additionalFeatures = [
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Access our AI content generator anytime, anywhere'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team on content projects'
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Built-in quality checks ensure professional output'
  },
  {
    icon: Target,
    title: 'Audience Targeting',
    description: 'Tailor content for specific audiences and demographics'
  }
];

const Features = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Modern Content Creation
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the advanced capabilities that make our AI the perfect partner 
            for your content creation needs.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-gray-800/30 rounded-3xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Even More Features
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Experience the Power of AI</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Try our advanced features today and see how AI can transform your content creation process.
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;