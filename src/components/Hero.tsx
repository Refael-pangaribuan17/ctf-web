
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Terminal, Network } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-cyber-blue/5 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyber-purple/5 filter blur-3xl"></div>
      </div>
      
      {/* Animated grid lines */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#0EA5E950_1px,transparent_1px)] bg-[size:20px_20px] opacity-5"></div>
      </div>
      
      {/* Badge */}
      <div className={`mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-cyber-blue/10 text-cyber-blue px-3 py-1 rounded-full text-sm font-medium border border-cyber-blue/20 inline-flex items-center">
          <Shield className="w-4 h-4 mr-1" />
          <span>CTF Tools for Beginners</span>
        </div>
      </div>
      
      {/* Heading */}
      <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="text-glow text-gradient">CTF Toolkit</span>
      </h1>
      
      {/* Animated subtitle with typewriter effect */}
      <div className={`h-8 mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xl text-gray-300 text-center relative">
          <span className="animate-text-reveal inline-block">
            Your ultimate collection of essential CTF tools
          </span>
        </p>
      </div>
      
      {/* Description */}
      <p className={`text-gray-400 max-w-2xl text-center mb-8 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Decode ciphers, analyze data, and solve challenges with our comprehensive toolkit designed specifically for Capture The Flag competitions. Perfect for beginners and experienced players alike.
      </p>
      
      {/* CTA Buttons */}
      <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Button asChild className="bg-cyber-blue hover:bg-cyber-blue/90 text-white flex items-center gap-2 px-6">
          <Link to="/tools">
            <Terminal className="w-4 h-4" />
            <span>Explore Tools</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/10">
          <Link to="/learn">
            <Network className="w-4 h-4 mr-2" />
            <span>Learn CTF Basics</span>
          </Link>
        </Button>
      </div>
      
      {/* Feature Highlights */}
      <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {[
          {
            icon: <Shield className="h-6 w-6 text-cyber-blue" />,
            title: "Cryptography",
            description: "Decode ciphers, hash functions, encoding techniques and more."
          },
          {
            icon: <Terminal className="h-6 w-6 text-cyber-blue" />,
            title: "Data Analysis",
            description: "Convert between different number systems and analyze hidden data."
          },
          {
            icon: <Network className="h-6 w-6 text-cyber-blue" />,
            title: "Web & Network",
            description: "Inspect packets, examine HTTP headers, and audit network security."
          }
        ].map((feature, index) => (
          <div 
            key={index} 
            className="glass-panel p-6 transition-all duration-300 hover:bg-white/10 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex items-center justify-center p-2 bg-cyber-blue/10 rounded-lg">
              {feature.icon}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* Decorative code snippets */}
      <div className="absolute bottom-10 left-10 hidden lg:block opacity-20 font-mono text-xs text-cyber-blue animate-float-slow">
        <div>01001100 01101111 01100001 01100100 01101001 01101110 01100111</div>
        <div>48 65 78 20 53 74 72 69 6e 67</div>
        <div>Y2lwaGVyIHRleHQ=</div>
      </div>
    </div>
  );
};

export default Hero;
