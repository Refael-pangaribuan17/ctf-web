
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const XORTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [inputFormat, setInputFormat] = useState('text');
  const [outputFormat, setOutputFormat] = useState('text');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input && key) {
      handleProcess();
    } else {
      setOutput('');
    }
  }, [input, key, mode, inputFormat, outputFormat]);

  const handleProcess = () => {
    if (!input || !key) return;
    
    setLoadingState('processing');

    // Simulate processing delay for visual effect
    setTimeout(() => {
      try {
        let inputBytes: number[];
        
        // Convert input to bytes based on format
        if (inputFormat === 'text') {
          inputBytes = Array.from(input).map(char => char.charCodeAt(0));
        } else if (inputFormat === 'hex') {
          const hexValues = input.trim().replace(/\s+/g, '').match(/.{1,2}/g) || [];
          inputBytes = hexValues.map(hex => parseInt(hex, 16));
        } else {
          throw new Error("Unsupported input format");
        }
        
        // Convert key to bytes
        const keyBytes = Array.from(key).map(char => char.charCodeAt(0));
        
        // Perform XOR operation
        const resultBytes = inputBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
        
        // Convert result to output format
        let result: string;
        if (outputFormat === 'text') {
          result = resultBytes.map(byte => String.fromCharCode(byte)).join('');
        } else if (outputFormat === 'hex') {
          result = resultBytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
        } else {
          throw new Error("Unsupported output format");
        }
        
        setOutput(result);
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (error) {
        toast({
          title: "Processing Error",
          description: "Invalid input for the selected operation.",
          variant: "destructive",
        });
        setOutput('');
        setLoadingState('idle');
      }
    }, 300);
  };

  const handleCopy = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "The result has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput('');
    setKey('');
    setOutput('');
    setMode('encrypt');
    setInputFormat('text');
    setOutputFormat('text');
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Key className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">XOR Cipher</h2>
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
              <ToggleGroupItem value="encrypt" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                <ArrowRight className="mr-1 h-4 w-4" />
                Encrypt
              </ToggleGroupItem>
              <ToggleGroupItem value="decrypt" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Decrypt
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-gray-400 mt-1">
              Note: XOR encryption and decryption use the same algorithm, this toggle is for reference only.
            </p>
          </div>

          {/* Format toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inputFormat" className="text-sm mb-2 block text-gray-300">
                Input Format
              </Label>
              <ToggleGroup
                type="single"
                value={inputFormat}
                onValueChange={(value) => value && setInputFormat(value)}
                className="w-full justify-start border border-border rounded-md overflow-hidden p-1"
              >
                <ToggleGroupItem value="text" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                  Text
                </ToggleGroupItem>
                <ToggleGroupItem value="hex" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                  Hex
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div>
              <Label htmlFor="outputFormat" className="text-sm mb-2 block text-gray-300">
                Output Format
              </Label>
              <ToggleGroup
                type="single"
                value={outputFormat}
                onValueChange={(value) => value && setOutputFormat(value)}
                className="w-full justify-start border border-border rounded-md overflow-hidden p-1"
              >
                <ToggleGroupItem value="text" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                  Text
                </ToggleGroupItem>
                <ToggleGroupItem value="hex" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                  Hex
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Key input */}
          <div className="w-full">
            <Label htmlFor="key" className="text-sm mb-2 block text-gray-300">
              XOR Key
            </Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter encryption/decryption key"
              className="font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              The key will be applied byte-by-byte to your input.
            </p>
          </div>

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              Input
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={inputFormat === 'text' 
                ? "Enter text to process..." 
                : "Enter hex values (e.g., 48 65 6c 6c 6f)..."
              }
              className="font-mono resize-y min-h-[100px]"
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
              className={`relative font-mono min-h-[100px] p-4 rounded-md bg-cyber-darker border border-cyber-dark transition-all duration-300 overflow-auto ${
                loadingState === 'processing' ? 'bg-cyber-dark/50' : ''
              }`}
            >
              {loadingState === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Processing...</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default XORTool;
