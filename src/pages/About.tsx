import React from 'react';
import { Users, Target, Award, Lightbulb, Heart, Globe } from 'lucide-react';

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Former AI researcher at Google with 10+ years in machine learning'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Ex-OpenAI engineer specializing in natural language processing'
  },
  {
    name: 'Emily Watson',
    role: 'Head of Product',
    image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Product strategist with expertise in AI-powered content tools'
  }
];

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We push the boundaries of AI technology to create cutting-edge solutions'
  },
  {
    icon: Heart,
    title: 'User-Centric',
    description: 'Every feature we build is designed with our users\' success in mind'
  },
  {
    icon: Globe,
    title: 'Accessibility',
    description: 'Making advanced AI technology accessible to businesses of all sizes'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from code to customer service'
  }
];

const About = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              About
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NextMind AI
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're on a mission to democratize content creation through advanced AI technology, 
            empowering businesses to tell their stories more effectively.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Founded in 2023 by a team of AI researchers and content strategists, NextMind AI was born 
              from the frustration of seeing businesses struggle with content creation. We witnessed 
              countless companies with amazing products and services unable to communicate their value effectively.
            </p>
            <p className="text-gray-400 leading-relaxed mb-6">
              Our founders, having worked at leading AI companies like Google and OpenAI, recognized 
              the potential of large language models to revolutionize content creation. We set out to 
              build a platform that would make professional-quality content accessible to everyone.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Today, we're proud to serve over 10,000 businesses worldwide, helping them create 
              compelling content that drives engagement and delivers results.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              To empower every business with AI-driven content creation tools that are powerful, 
              accessible, and designed for real-world success.
            </p>
            <h3 className="text-2xl font-bold text-white mb-6">Our Vision</h3>
            <p className="text-gray-300 leading-relaxed">
              A world where great ideas are never held back by the challenge of content creation, 
              where every business can communicate their value with clarity and impact.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Values
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-blue-400 mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Journey</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion for AI and content creation. 
            Explore opportunities to be part of our growing team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
              View Careers
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;