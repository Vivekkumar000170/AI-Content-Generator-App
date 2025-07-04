import React from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import Features from '../components/Features';
import ContentGenerator from '../components/ContentGenerator';
import PosterBannerGenerator from '../components/PosterBannerGenerator';
import EmailVerificationDemo from '../components/EmailVerificationDemo';

const Home = () => {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <ContentGenerator />
      <div id="poster-banner-generator">
        <PosterBannerGenerator />
      </div>
      <EmailVerificationDemo />
    </>
  );
};

export default Home;