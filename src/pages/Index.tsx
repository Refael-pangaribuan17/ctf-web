
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <motion.main 
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BackgroundAnimation />
      <Navbar />
      <Hero />
    </motion.main>
  );
};

export default Index;
