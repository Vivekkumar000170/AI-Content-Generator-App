import React from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import ContentGenerator from '../components/ContentGenerator';

const Home = () => {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <ContentGenerator />
    </>
  );
};

export default Home;