
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BackgroundAnimation from '@/components/BackgroundAnimation';

const Index = () => {
  return (
    <main className="min-h-screen">
      <BackgroundAnimation />
      <Navbar />
      <Hero />
    </main>
  );
};

export default Index;
