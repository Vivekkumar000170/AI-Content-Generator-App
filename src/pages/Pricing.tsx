import React, { useState } from 'react';
import { Check, Zap, Crown, Rocket, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';

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
    popular: false,
    buttonText: 'Start Free Trial',
    savings: null
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
    popular: true,
    buttonText: 'Start Free Trial',
    savings: 'Save $120/year'
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
    popular: false,
    buttonText: 'Contact Sales',
    savings: 'Custom pricing'
  }
];

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handlePlanSelect = (planName: string) => {
    if (planName === 'Enterprise') {
      // For enterprise, you might want to open a contact form or redirect to a contact page
      alert('Thank you for your interest! Our sales team will contact you within 24 hours.');
    } else if (isAuthenticated) {
      // User is logged in, simulate upgrade process
      alert(`Upgrading to ${planName} plan... (This would redirect to payment processing)`);
    } else {
      // Show signup modal with selected plan
      setSelectedPlan(planName);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">7-Day Free Trial • No Credit Card Required</span>
            </div>
            
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
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-1">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <div className="text-green-400 text-sm font-medium">{plan.savings}</div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePlanSelect(plan.name)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/25'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <span>{plan.buttonText}</span>
                    {plan.name !== 'Enterprise' && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span>Secure payment processing</span>
              </div>
            </div>
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
                <p className="text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any billing differences.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Is there a free trial?</h3>
                <p className="text-gray-400">Yes, all plans come with a 7-day free trial. No credit card required to start, and you can cancel anytime during the trial period.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">What payment methods do you accept?</h3>
                <p className="text-gray-400">We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Do you offer refunds?</h3>
                <p className="text-gray-400">Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service. No questions asked.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Can I use my own OpenAI API key?</h3>
                <p className="text-gray-400">Yes, Professional and Enterprise plans allow you to use your own OpenAI API key for unlimited usage and better cost control.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Is my data secure?</h3>
                <p className="text-gray-400">Absolutely. We use bank-level encryption, never store your content permanently, and are fully GDPR compliant. Your data is always protected.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </>
  );
};

export default Pricing;