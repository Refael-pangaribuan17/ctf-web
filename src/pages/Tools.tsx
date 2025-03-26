
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, KeySquare, Code, Network, Globe, Database, RotateCw, Key, Shield, Terminal, Image, Wifi, FileSearch, Braces, KeyRound, Bug, Search, ChevronLeft, FileArchive } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ToolCard from '@/components/ToolCard';
import CaesarCipher from '@/components/tools/CaesarCipher';
import Base64Tool from '@/components/tools/Base64Tool';
import HexConverter from '@/components/tools/HexConverter';
import ROT13Tool from '@/components/tools/ROT13Tool';
import BinaryConverter from '@/components/tools/BinaryConverter';
import URLTool from '@/components/tools/URLTool';
import HTTPHeaderTool from '@/components/tools/HTTPHeaderTool';
import HashGeneratorTool from '@/components/tools/HashGeneratorTool';
import XORTool from '@/components/tools/XORTool';
import SteganographyTool from '@/components/tools/SteganographyTool';
import WifiAnalyzerTool from '@/components/tools/WifiAnalyzerTool';
import MetadataExtractorTool from '@/components/tools/MetadataExtractorTool';
import JWTDecoderTool from '@/components/tools/JWTDecoderTool';
import PasswordCrackingTool from '@/components/tools/PasswordCrackingTool';
import WebExploitTool from '@/components/tools/WebExploitTool';
import ReconTool from '@/components/tools/ReconTool';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.FC;
  category: 'cryptography' | 'web' | 'forensics' | 'network' | 'exploitation';
};

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tools: Tool[] = [
    {
      id: 'caesar',
      title: 'Caesar Cipher',
      description: 'Encode or decode text using the classic Caesar shift cipher',
      icon: Lock,
      component: CaesarCipher,
      category: 'cryptography'
    },
    {
      id: 'base64',
      title: 'Base64 Encoder/Decoder',
      description: 'Convert text to and from Base64 encoding',
      icon: KeySquare,
      component: Base64Tool,
      category: 'cryptography'
    },
    {
      id: 'hex',
      title: 'Hex Converter',
      description: 'Convert between ASCII text and hexadecimal representation',
      icon: Code,
      component: HexConverter,
      category: 'cryptography'
    },
    {
      id: 'binary',
      title: 'Binary Converter',
      description: 'Convert between decimal, binary, text, and hex formats',
      icon: Database,
      component: BinaryConverter,
      category: 'cryptography'
    },
    {
      id: 'rot13',
      title: 'ROT13 Encoder/Decoder',
      description: 'Encode or decode text using the ROT13 cipher algorithm',
      icon: RotateCw,
      component: ROT13Tool,
      category: 'cryptography'
    },
    {
      id: 'url',
      title: 'URL Encoder/Decoder',
      description: 'Encode and decode URL components',
      icon: Globe,
      component: URLTool,
      category: 'web'
    },
    {
      id: 'http',
      title: 'HTTP Header Inspector',
      description: 'Analyze HTTP requests and responses',
      icon: Network,
      component: HTTPHeaderTool,
      category: 'web'
    },
    {
      id: 'hash',
      title: 'Hash Generator',
      description: 'Generate MD5, SHA-1, SHA-256 hashes',
      icon: Shield,
      component: HashGeneratorTool,
      category: 'cryptography'
    },
    {
      id: 'xor',
      title: 'XOR Cipher',
      description: 'Encrypt and decrypt data using XOR operations',
      icon: Key,
      component: XORTool,
      category: 'cryptography'
    },
    {
      id: 'steg',
      title: 'Advanced Steganography',
      description: 'Detect, extract and hide data in images, audio, and archives',
      icon: Image,
      component: SteganographyTool,
      category: 'forensics'
    },
    {
      id: 'wifi',
      title: 'WiFi Analyzer',
      description: 'Tools for WiFi packet and handshake analysis',
      icon: Wifi,
      component: WifiAnalyzerTool,
      category: 'network'
    },
    {
      id: 'metadata',
      title: 'Metadata Extractor',
      description: 'Extract metadata from images and other files',
      icon: FileSearch,
      component: MetadataExtractorTool,
      category: 'forensics'
    },
    {
      id: 'jwt',
      title: 'JWT Decoder',
      description: 'Decode and analyze JSON Web Tokens',
      icon: Braces,
      component: JWTDecoderTool,
      category: 'web'
    },
    {
      id: 'password',
      title: 'Password Cracker',
      description: 'Recover passwords from various hash types',
      icon: KeyRound,
      component: PasswordCrackingTool,
      category: 'exploitation'
    },
    {
      id: 'webexploit',
      title: 'Web Exploitation',
      description: 'Tools for testing SQL injection, XSS, and other web vulnerabilities',
      icon: Bug,
      component: WebExploitTool,
      category: 'exploitation'
    },
    {
      id: 'recon',
      title: 'Reconnaissance',
      description: 'DNS, WHOIS, and port scanning tools for information gathering',
      icon: Search,
      component: ReconTool,
      category: 'network'
    },
    {
      id: 'archive',
      title: 'Archive Analyzer',
      description: 'Extract and analyze contents of ZIP, RAR, and other archive formats',
      icon: FileArchive,
      component: SteganographyTool,
      category: 'forensics'
    }
  ];

  const categories = [
    { id: 'cryptography', name: 'Cryptography', icon: Lock },
    { id: 'web', name: 'Web Security', icon: Globe },
    { id: 'forensics', name: 'Digital Forensics', icon: FileSearch },
    { id: 'network', name: 'Network Security', icon: Wifi },
    { id: 'exploitation', name: 'Exploitation', icon: Bug }
  ];

  useEffect(() => {
    // Reset selected tool when category changes
    setSelectedTool(null);
  }, [activeCategory]);

  const handleSelectTool = (toolId: string) => {
    if (isTransitioning) return;
    
    if (selectedTool === toolId) {
      // Deselect the tool
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedTool(null);
        setIsTransitioning(false);
      }, 300);
    } else {
      // Select a new tool
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedTool(toolId);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const filteredTools = tools
    .filter(tool => !activeCategory || tool.category === activeCategory)
    .filter(tool => 
      searchTerm === '' || 
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const selectedToolData = tools.find(tool => tool.id === selectedTool);

  return (
    <main className="min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20 z-0"></div>
      <BackgroundAnimation />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 cyber-glow-text"
            data-text="CTF Toolkit"
          >
            <span className="cyber-glitch-1">CTF Toolkit</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A collection of essential tools to help you decode, convert, and analyze data for Capture The Flag challenges.
          </p>
          
          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search tools..."
                className="w-full py-2 px-4 pl-10 bg-cyber-dark/50 cyber-border rounded-full focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </motion.div>
        
        {!selectedTool && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center">
            <Button
              variant={activeCategory === null ? "secondary" : "outline"}
              className={cn(
                "transition-all duration-300",
                activeCategory === null && "bg-cyber-blue text-white hover:bg-cyber-blue/80"
              )}
              onClick={() => setActiveCategory(null)}
            >
              All Tools
            </Button>
            
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "outline"}
                className={cn(
                  "transition-all duration-300",
                  activeCategory === category.id && "bg-cyber-blue text-white hover:bg-cyber-blue/80"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        )}
        
        <div className="max-w-6xl mx-auto">
          {selectedTool ? (
            <div className="mb-6 animate-fade-up">
              <Button
                variant="ghost"
                onClick={() => handleSelectTool(selectedTool)}
                className="text-gray-300 hover:text-white mb-4 group flex items-center"
              >
                <ChevronLeft className="mr-1 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to all tools
              </Button>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTool}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedToolData && React.createElement(selectedToolData.component)}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <ToolCard
                        title={tool.title}
                        description={tool.description}
                        icon={tool.icon}
                        onClick={() => handleSelectTool(tool.id)}
                        delayIndex={index}
                        className="tool-card"
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-20">
                    <p className="text-gray-400 text-xl">No tools found matching "{searchTerm}"</p>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-cyber-blue"
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
};

export default Tools;
