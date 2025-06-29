import React from 'react';
import { Brain, Zap, Shield, Globe, Cpu, Network } from 'lucide-react';

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

const Features = () => {
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Modern Content Creation
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the advanced capabilities that make our AI the perfect partner 
            for your content creation needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </div>
    </section>
  );
};

export default Features;