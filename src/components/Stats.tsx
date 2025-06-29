import React from 'react';
import { TrendingUp, Users, Clock, Award } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10K+',
    label: 'Active Users',
    description: 'Trusted by businesses worldwide'
  },
  {
    icon: TrendingUp,
    value: '150%',
    label: 'Productivity Boost',
    description: 'Average improvement in content creation speed'
  },
  {
    icon: Clock,
    value: '2.5s',
    label: 'Average Response',
    description: 'Lightning-fast content generation'
  },
  {
    icon: Award,
    value: '99.8%',
    label: 'Satisfaction Rate',
    description: 'Customer satisfaction score'
  }
];

const Stats = () => {
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Trusted by Industry Leaders
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of businesses already transforming their content strategy
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white font-semibold mb-1">{stat.label}</div>
                  <div className="text-gray-400 text-sm">{stat.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;