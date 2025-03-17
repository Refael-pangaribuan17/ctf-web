
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, KeySquare, Code, Network, Globe, Database, RotateCw, Key, Shield, Terminal, Image, Wifi, FileSearch, Braces } from 'lucide-react';
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
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tool = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  component: React.FC;
};

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const tools: Tool[] = [
    {
      id: 'caesar',
      title: 'Caesar Cipher',
      description: 'Encode or decode text using the classic Caesar shift cipher',
      icon: Lock,
      component: CaesarCipher
    },
    {
      id: 'base64',
      title: 'Base64 Encoder/Decoder',
      description: 'Convert text to and from Base64 encoding',
      icon: KeySquare,
      component: Base64Tool
    },
    {
      id: 'hex',
      title: 'Hex Converter',
      description: 'Convert between ASCII text and hexadecimal representation',
      icon: Code,
      component: HexConverter
    },
    {
      id: 'binary',
      title: 'Binary Converter',
      description: 'Convert between decimal, binary, text, and hex formats',
      icon: Database,
      component: BinaryConverter
    },
    {
      id: 'rot13',
      title: 'ROT13 Encoder/Decoder',
      description: 'Encode or decode text using the ROT13 cipher algorithm',
      icon: RotateCw,
      component: ROT13Tool
    },
    {
      id: 'url',
      title: 'URL Encoder/Decoder',
      description: 'Encode and decode URL components',
      icon: Globe,
      component: URLTool
    },
    {
      id: 'http',
      title: 'HTTP Header Inspector',
      description: 'Analyze HTTP requests and responses',
      icon: Network,
      component: HTTPHeaderTool
    },
    {
      id: 'hash',
      title: 'Hash Generator',
      description: 'Generate MD5, SHA-1, SHA-256 hashes',
      icon: Shield,
      component: HashGeneratorTool
    },
    {
      id: 'xor',
      title: 'XOR Cipher',
      description: 'Encrypt and decrypt data using XOR operations',
      icon: Key,
      component: XORTool
    },
    {
      id: 'steg',
      title: 'Steganography Detector',
      description: 'Analyze images for hidden steganographic content',
      icon: Image,
      component: SteganographyTool
    },
    {
      id: 'wifi',
      title: 'WiFi Analyzer',
      description: 'Tools for WiFi packet and handshake analysis',
      icon: Wifi,
      component: WifiAnalyzerTool
    },
    {
      id: 'metadata',
      title: 'Metadata Extractor',
      description: 'Extract metadata from images and other files',
      icon: FileSearch,
      component: MetadataExtractorTool
    },
    {
      id: 'jwt',
      title: 'JWT Decoder',
      description: 'Decode and analyze JSON Web Tokens',
      icon: Braces,
      component: JWTDecoderTool
    }
  ];

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

  const selectedToolData = tools.find(tool => tool.id === selectedTool);

  return (
    <main className="min-h-screen pb-20">
      <BackgroundAnimation />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold mb-4 text-gradient">CTF Toolkit</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A collection of essential tools to help you decode, convert, and analyze data for Capture The Flag challenges.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {selectedTool ? (
            <div className="mb-6 animate-fade-up">
              <Button
                variant="ghost"
                onClick={() => handleSelectTool(selectedTool)}
                className="text-gray-300 hover:text-white mb-4"
              >
                ← Back to all tools
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  onClick={() => handleSelectTool(tool.id)}
                  delayIndex={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Tools;
