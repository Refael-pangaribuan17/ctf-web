
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCw, Copy, RotateCcw, Wand2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const ROT13Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (input) {
      handleProcess();
    } else {
      setOutput('');
    }
  }, [input, mode]);

  const handleProcess = () => {
    if (!input) return;
    
    setLoadingState('processing');

    // Simulate processing delay for visual effect
    setTimeout(() => {
      const result = rot13(input);
      setOutput(result);
      setLoadingState('complete');
      
      // Reset complete state after a moment
      setTimeout(() => {
        setLoadingState('idle');
      }, 500);
    }, 300);
  };

  const rot13 = (text: string) => {
    return text
      .split('')
      .map(char => {
        // Handle uppercase letters
        if (char.match(/[A-Z]/)) {
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        }
        // Handle lowercase letters
        if (char.match(/[a-z]/)) {
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - 97 + 13) % 26) + 97);
        }
        // Return unchanged for non-alphabetic characters
        return char;
      })
      .join('');
  };

  const handleCopy = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setMode('encode');
  };

  const handleExample = () => {
    setInput('The quick brown fox jumps over the lazy dog.');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="cyber-panel p-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyber-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-cyber-purple/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center mb-6">
          <motion.div 
            className="mr-2 h-10 w-10 flex items-center justify-center bg-cyber-blue/20 rounded-full"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <RotateCcw className="h-5 w-5 text-cyber-blue" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gradient">ROT13 Encoder/Decoder</h2>
            <p className="text-xs text-gray-400">A simple letter substitution cipher that replaces a letter with the 13th letter after it</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleExample}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              Example
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleReset}
            >
              <RotateCw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Mode toggle */}
          <motion.div variants={itemVariants} className="w-full">
            <Label htmlFor="mode" className="text-sm mb-2 block text-gray-300">
              Mode
            </Label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && setMode(value)}
              className="w-full justify-start border border-border rounded-md overflow-hidden p-1 cyber-border"
            >
              <ToggleGroupItem value="encode" className="flex-1 data-[state=on]:bg-cyber-blue/20 data-[state=on]:text-white">
                <ArrowRight className="mr-1 h-4 w-4" />
                Encode
              </ToggleGroupItem>
              <ToggleGroupItem value="decode" className="flex-1 data-[state=on]:bg-cyber-blue/20 data-[state=on]:text-white">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Decode
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-gray-400 mt-1 flex items-center">
              <span className="inline-block w-2 h-2 bg-cyber-blue/50 rounded-full mr-1"></span>
              Note: ROT13 is its own inverse - encoding and decoding use the same algorithm.
            </p>
          </motion.div>

          {/* Input field */}
          <motion.div variants={itemVariants} className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              Input Text
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? "Enter text to encode with ROT13..." : "Enter text to decode from ROT13..."}
              className="font-mono resize-y min-h-[100px] cyber-border focus:border-cyber-blue"
            />
          </motion.div>

          {/* Output display */}
          <motion.div variants={itemVariants} className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="output" className="text-sm text-gray-300">
                Result
              </Label>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-xs hover:bg-cyber-blue/20"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              )}
            </div>
            <div
              className={`relative font-mono min-h-[100px] p-4 rounded-md cyber-border transition-all duration-300 overflow-auto ${
                loadingState === 'processing' ? 'bg-cyber-dark/70' : 'bg-cyber-darker'
              }`}
            >
              {loadingState === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-cyber-blue flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyber-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 break-all ${output ? 'opacity-100' : 'opacity-50'}`}>
                  {output || "Result will appear here..."}
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
                <div 
                  className={`h-full bg-cyber-blue transition-transform duration-500 ${
                    loadingState === 'processing' ? 'translate-x-0' : '-translate-x-full'
                  }`}
                ></div>
              </div>
            </div>
          </motion.div>
          
          {/* Show hint button */}
          <motion.div variants={itemVariants} className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              {showHint ? "Hide hint" : "Show hint"}
            </Button>
            
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 glass-panel text-xs text-gray-300"
              >
                <p className="mb-1 font-medium text-cyber-blue">What is ROT13?</p>
                <p>ROT13 ("rotate by 13 places") is a simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet.</p>
                <p className="mt-2">Example: <span className="text-white">A → N, B → O, C → P, ... Z → M</span></p>
                <table className="mt-2 w-full text-center">
                  <tbody>
                    <tr>
                      <td className="py-1 border-b border-cyber-dark/50">Input:</td>
                      <td className="py-1 border-b border-cyber-dark/50 font-mono">A B C D E F G H I J K L M</td>
                    </tr>
                    <tr>
                      <td className="py-1">Output:</td>
                      <td className="py-1 font-mono text-white">N O P Q R S T U V W X Y Z</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ROT13Tool;
