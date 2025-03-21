
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BinaryConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromFormat, setFromFormat] = useState('text');
  const [toFormat, setToFormat] = useState('binary');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleProcess();
    } else {
      setOutput('');
    }
  }, [input, fromFormat, toFormat]);

  const handleProcess = () => {
    if (!input) return;
    
    setLoadingState('processing');

    // Simulate processing delay for visual effect
    setTimeout(() => {
      try {
        let result = '';
        
        if (fromFormat === 'text') {
          // Get UTF-8 encoded bytes for proper unicode support
          const encoder = new TextEncoder();
          const textToBytes = Array.from(encoder.encode(input));
          
          if (toFormat === 'binary') {
            result = textToBytes.map(byte => byte.toString(2).padStart(8, '0')).join(' ');
          } else if (toFormat === 'decimal') {
            result = textToBytes.join(' ');
          } else if (toFormat === 'hex') {
            result = textToBytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
          }
        } 
        else if (fromFormat === 'binary') {
          // Process binary input with validation
          const binaries = input.trim().replace(/[^01\s]/g, '').split(/\s+/);
          
          // Validate each binary number
          const validBinaries = binaries.filter(bin => /^[01]+$/.test(bin) && bin.length <= 32);
          
          if (validBinaries.length !== binaries.length) {
            throw new Error("Invalid binary format. Binary values must contain only 0s and 1s.");
          }
          
          const bytes = validBinaries.map(bin => parseInt(bin, 2));
          
          if (toFormat === 'text') {
            // Convert to UTF-8 text
            const decoder = new TextDecoder();
            const uint8Array = new Uint8Array(bytes);
            result = decoder.decode(uint8Array);
          } else if (toFormat === 'decimal') {
            result = bytes.join(' ');
          } else if (toFormat === 'hex') {
            result = bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
          }
        }
        else if (fromFormat === 'decimal') {
          // Process decimal input with validation
          const decimals = input.trim().replace(/[^0-9\s]/g, '').split(/\s+/);
          
          // Validate decimal numbers
          const validDecimals = decimals.filter(dec => /^\d+$/.test(dec) && parseInt(dec, 10) < 256);
          
          if (validDecimals.length !== decimals.length) {
            throw new Error("Invalid decimal format. Values must be between 0-255.");
          }
          
          const bytes = validDecimals.map(dec => parseInt(dec, 10));
          
          if (toFormat === 'text') {
            // Convert to UTF-8 text
            const decoder = new TextDecoder();
            const uint8Array = new Uint8Array(bytes);
            result = decoder.decode(uint8Array);
          } else if (toFormat === 'binary') {
            result = bytes.map(dec => dec.toString(2).padStart(8, '0')).join(' ');
          } else if (toFormat === 'hex') {
            result = bytes.map(dec => dec.toString(16).padStart(2, '0')).join(' ');
          }
        }
        else if (fromFormat === 'hex') {
          // Process hex input with validation
          const hexValues = input.trim().replace(/[^0-9a-fA-F\s]/g, '').split(/\s+/);
          
          // Validate hex values
          const validHex = hexValues.filter(hex => /^[0-9a-fA-F]+$/.test(hex) && hex.length <= 8);
          
          if (validHex.length !== hexValues.length) {
            throw new Error("Invalid hexadecimal format. Hex values must contain only 0-9 and A-F.");
          }
          
          const bytes = validHex.map(hex => parseInt(hex, 16));
          
          if (toFormat === 'text') {
            // Convert to UTF-8 text
            const decoder = new TextDecoder();
            const uint8Array = new Uint8Array(bytes);
            result = decoder.decode(uint8Array);
          } else if (toFormat === 'binary') {
            result = bytes.map(byte => byte.toString(2).padStart(8, '0')).join(' ');
          } else if (toFormat === 'decimal') {
            result = bytes.join(' ');
          }
        }
        
        setOutput(result);
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Invalid input for the selected conversion.";
        toast({
          title: "Processing Error",
          description: errorMessage,
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
    setOutput('');
    setFromFormat('text');
    setToFormat('binary');
  };

  const getInputPlaceholder = () => {
    switch (fromFormat) {
      case 'text': return "Enter text to convert...";
      case 'binary': return "Enter binary values (e.g., 01101000 01101001)...";
      case 'decimal': return "Enter decimal values (e.g., 104 101 108 108 111)...";
      case 'hex': return "Enter hex values (e.g., 68 65 6c 6c 6f)...";
      default: return "Enter input...";
    }
  };

  // Helper function to generate example input based on current formats
  const getExampleInput = () => {
    const exampleText = "Hello";
    const encoder = new TextEncoder();
    const bytes = Array.from(encoder.encode(exampleText));
    
    switch (fromFormat) {
      case 'text': return exampleText;
      case 'binary': return bytes.map(b => b.toString(2).padStart(8, '0')).join(' ');
      case 'decimal': return bytes.join(' ');
      case 'hex': return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
      default: return exampleText;
    }
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Database className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Binary Converter</h2>
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
          {/* Conversion format selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromFormat" className="text-sm mb-2 block text-gray-300">
                From
              </Label>
              <Select value={fromFormat} onValueChange={setFromFormat}>
                <SelectTrigger id="fromFormat" className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (UTF-8)</SelectItem>
                  <SelectItem value="binary">Binary</SelectItem>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="hex">Hexadecimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="toFormat" className="text-sm mb-2 block text-gray-300">
                To
              </Label>
              <Select value={toFormat} onValueChange={setToFormat}>
                <SelectTrigger id="toFormat" className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {fromFormat !== "text" && <SelectItem value="text">Text (UTF-8)</SelectItem>}
                  {fromFormat !== "binary" && <SelectItem value="binary">Binary</SelectItem>}
                  {fromFormat !== "decimal" && <SelectItem value="decimal">Decimal</SelectItem>}
                  {fromFormat !== "hex" && <SelectItem value="hex">Hexadecimal</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Example button */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput(getExampleInput())}
              className="text-xs"
            >
              Use Example
            </Button>
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
              placeholder={getInputPlaceholder()}
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

export default BinaryConverter;
