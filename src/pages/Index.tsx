
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Shield, Lock, Database, Braces, Terminal, Code, 
  LineChart, ArrowRight, Cpu, Wifi, KeyRound
} from 'lucide-react';

const CodeSnippet = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-black/40 border border-cyber-blue/30 p-4 rounded-md font-mono text-xs sm:text-sm text-cyber-blue/80 overflow-x-auto">
    {children}
  </div>
);

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay?: number;
}) => (
  <motion.div 
    className="bg-black/30 backdrop-blur-sm border border-cyber-blue/20 rounded-lg p-6 hover:border-cyber-blue/60 transition-colors duration-300"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + (delay * 0.1), duration: 0.5 }}
  >
    <div className="bg-cyber-blue/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="text-cyber-blue h-6 w-6" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const StatCard = ({ value, label, icon: Icon, delay = 0 }: { value: string; label: string; icon: React.ElementType; delay?: number }) => (
  <motion.div 
    className="bg-black/20 backdrop-blur-sm border border-cyber-blue/10 rounded-lg p-5 flex flex-col items-center justify-center text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.3 + (delay * 0.1), duration: 0.4 }}
  >
    <Icon className="text-cyber-blue h-6 w-6 mb-2" />
    <span className="text-3xl font-bold text-white mb-1">{value}</span>
    <span className="text-gray-400 text-sm">{label}</span>
  </motion.div>
);

const Index = () => {
  return (
    <motion.main 
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BackgroundAnimation />
      
      {/* Decorative Code Snippets */}
      <div className="absolute top-40 -left-10 opacity-20 rotate-12 transform scale-75 z-0 hidden lg:block">
        <CodeSnippet>
          {`function decryptFlag(ciphertext, key) {
  let plaintext = '';
  for (let i = 0; i < ciphertext.length; i++) {
    plaintext += String.fromCharCode(
      ciphertext.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return plaintext;
}`}
        </CodeSnippet>
      </div>
      
      <div className="absolute bottom-60 -right-10 opacity-20 -rotate-12 transform scale-75 z-0 hidden lg:block">
        <CodeSnippet>
          {`# Python script to crack weak hashes
import hashlib
import itertools

def bruteforce_md5(hash_to_crack, charset, max_length):
    for length in range(1, max_length + 1):
        for attempt in itertools.product(charset, repeat=length):
            attempt_str = ''.join(attempt)
            attempt_hash = hashlib.md5(attempt_str.encode()).hexdigest()
            if attempt_hash == hash_to_crack:
                return attempt_str
    return None`}
        </CodeSnippet>
      </div>
      
      <Navbar />
      <Hero />
      
      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <StatCard value="25+" icon={Shield} label="CTF Tools" delay={0} />
          <StatCard value="100+" icon={Terminal} label="Challenges Solved" delay={1} />
          <StatCard value="10+" icon={Database} label="Categories" delay={2} />
          <StatCard value="24/7" icon={Cpu} label="Online Support" delay={3} />
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Powerful Tools for CTF Competitors</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our suite of specialized tools helps you decode, decrypt, analyze, and solve complex challenges in Capture The Flag competitions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Lock}
            title="Crypto Challenges"
            description="Tools for breaking cryptographic challenges, including classic and modern ciphers."
            delay={0}
          />
          <FeatureCard 
            icon={Code}
            title="Web Exploitation"
            description="Analyze and exploit web vulnerabilities with our specialized web tools."
            delay={1}
          />
          <FeatureCard 
            icon={Braces}
            title="Reverse Engineering"
            description="Tools to help disassemble, decompile and understand compiled programs."
            delay={2}
          />
          <FeatureCard 
            icon={Terminal}
            title="Forensics"
            description="Extract hidden data, analyze metadata, and recover deleted information."
            delay={3}
          />
          <FeatureCard 
            icon={Wifi}
            title="Network Analysis"
            description="Inspect network traffic, analyze packets, and extract sensitive data."
            delay={4}
          />
          <FeatureCard 
            icon={KeyRound}
            title="Password Cracking"
            description="Recover passwords from hashes using advanced dictionary and brute force techniques."
            delay={5}
          />
        </div>
      </section>
      
      {/* CTF Categories */}
      <section className="container mx-auto px-4 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">Prepare for Any Challenge</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our tools cover all major CTF categories to help you excel in competitions.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[
            "Cryptography", "Web Exploitation", "Binary Exploitation", 
            "Reverse Engineering", "Forensics", "OSINT", 
            "Steganography", "Network Security"
          ].map((category, index) => (
            <div 
              key={category} 
              className="bg-black/20 border border-cyber-blue/10 rounded px-4 py-3 text-gray-300 hover:border-cyber-blue/50 hover:bg-black/30 transition-all duration-300"
            >
              {category}
            </div>
          ))}
        </motion.div>
      </section>
      
      {/* CTA Banner */}
      <motion.section 
        className="container mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/30">
          <div className="absolute inset-0 bg-cyber-grid opacity-10"></div>
          <div className="p-8 md:p-12 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to crack some challenges?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl">
              Dive into our comprehensive collection of CTF tools and resources to enhance your skills and tackle any challenge.
            </p>
            <Link to="/tools">
              <Button className="group bg-cyber-blue hover:bg-cyber-blue/80">
                Explore Tools
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
      
    </motion.main>
  );
};

export default Index;
