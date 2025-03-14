import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CaesarCipher: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [shift, setShift] = useState([3]);
  const [mode, setMode] = useState('encode');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleProcess();
    }
  }, [input, shift, mode]);

  const handleProcess = () => {
    if (!input) return;
    
    setLoadingState('processing');

    // Simulate processing delay for visual effect
    setTimeout(() => {
      const shiftValue = mode === 'encode' ? shift[0] : 26 - shift[0];
      const result = caesarCipher(input, shiftValue);
      setOutput(result);
      setLoadingState('complete');
      
      // Reset complete state after a moment
      setTimeout(() => {
        setLoadingState('idle');
      }, 500);
    }, 300);
  };

  const caesarCipher = (text: string, shift: number) => {
    return text
      .split('')
      .map(char => {
        // Handle uppercase letters
        if (char.match(/[A-Z]/)) {
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Handle lowercase letters
        if (char.match(/[a-z]/)) {
          const code = char.charCodeAt(0);
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
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
    setShift([3]);
    setMode('encode');
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Lock className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Caesar Cipher</h2>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleReset}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        </div>

        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="w-full">
            <Label htmlFor="mode" className="text-sm mb-2 block text-gray-300">
              Mode
            </Label>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && setMode(value)}
              className="w-full justify-start border border-border rounded-md overflow-hidden p-1"
            >
              <ToggleGroupItem value="encode" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                <ArrowRight className="mr-1 h-4 w-4" />
                Encode
              </ToggleGroupItem>
              <ToggleGroupItem value="decode" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Decode
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Shift control */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="shift" className="text-sm text-gray-300">
                Shift Value
              </Label>
              <span className="text-cyber-blue font-mono text-lg font-bold">
                {shift[0]}
              </span>
            </div>
            <Slider
              id="shift"
              min={1}
              max={25}
              step={1}
              value={shift}
              onValueChange={setShift}
              className="mb-4"
            />
          </div>

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              Input Text
            </Label>
            <Input
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? "Enter text to encode..." : "Enter text to decode..."}
              className="font-mono"
            />
          </div>

          {/* Output display */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="output" className="text-sm text-gray-300">
                Result
              </Label>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              )}
            </div>
            <div
              className={`relative font-mono min-h-[80px] p-4 rounded-md bg-cyber-darker border border-cyber-dark transition-all duration-300 overflow-hidden ${
                loadingState === 'processing' ? 'bg-cyber-dark/50' : ''
              }`}
            >
              {loadingState === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Processing...</div>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 ${output ? 'opacity-100' : 'opacity-50'}`}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaesarCipher;
