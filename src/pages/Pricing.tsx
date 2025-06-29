import React from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals and small projects',
    icon: Zap,
    features: [
      '1,000 AI-generated words/month',
      'Basic content types',
      'Email support',
      'Standard templates',
      'Export to text/markdown'
    ],
    gradient: 'from-blue-500 to-cyan-500',
    popular: false
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    description: 'Ideal for growing businesses and content creators',
    icon: Crown,
    features: [
      '10,000 AI-generated words/month',
      'All content types',
      'Priority support',
      'Advanced templates',
      'SEO optimization',
      'Team collaboration (3 users)',
      'API access'
    ],
    gradient: 'from-purple-500 to-pink-500',
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For large teams and high-volume content needs',
    icon: Rocket,
    features: [
      'Unlimited AI-generated words',
      'All content types + custom',
      '24/7 dedicated support',
      'Custom templates',
      'Advanced SEO tools',
      'Unlimited team members',
      'Full API access',
      'Custom integrations',
      'White-label options'
    ],
    gradient: 'from-orange-500 to-red-500',
    popular: false
  }
];

const Pricing = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Simple, Transparent
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect plan for your content creation needs. 
            All plans include our core AI features with no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-gray-800/50 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/25' 
                    : 'border-gray-700 hover:border-blue-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/25'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}>
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800/30 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Can I change plans anytime?</h3>
              <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Is there a free trial?</h3>
              <p className="text-gray-400">Yes, all plans come with a 7-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h3>
              <p className="text-gray-400">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;