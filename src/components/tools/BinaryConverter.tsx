
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
          const textToBytes = Array.from(input).map(char => char.charCodeAt(0));
          
          if (toFormat === 'binary') {
            result = textToBytes.map(byte => byte.toString(2).padStart(8, '0')).join(' ');
          } else if (toFormat === 'decimal') {
            result = textToBytes.join(' ');
          } else if (toFormat === 'hex') {
            result = textToBytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
          }
        } 
        else if (fromFormat === 'binary') {
          const binaries = input.trim().split(/\s+/);
          const bytes = binaries.map(bin => parseInt(bin, 2));
          
          if (toFormat === 'text') {
            result = bytes.map(byte => String.fromCharCode(byte)).join('');
          } else if (toFormat === 'decimal') {
            result = bytes.join(' ');
          } else if (toFormat === 'hex') {
            result = bytes.map(byte => byte.toString(16).padStart(2, '0')).join(' ');
          }
        }
        else if (fromFormat === 'decimal') {
          const decimals = input.trim().split(/\s+/).map(num => parseInt(num, 10));
          
          if (toFormat === 'text') {
            result = decimals.map(dec => String.fromCharCode(dec)).join('');
          } else if (toFormat === 'binary') {
            result = decimals.map(dec => dec.toString(2).padStart(8, '0')).join(' ');
          } else if (toFormat === 'hex') {
            result = decimals.map(dec => dec.toString(16).padStart(2, '0')).join(' ');
          }
        }
        else if (fromFormat === 'hex') {
          const hexValues = input.trim().split(/\s+/);
          const bytes = hexValues.map(hex => parseInt(hex, 16));
          
          if (toFormat === 'text') {
            result = bytes.map(byte => String.fromCharCode(byte)).join('');
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
        toast({
          title: "Processing Error",
          description: "Invalid input for the selected conversion.",
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
                  <SelectItem value="text">Text (ASCII)</SelectItem>
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
                  {fromFormat !== "text" && <SelectItem value="text">Text (ASCII)</SelectItem>}
                  {fromFormat !== "binary" && <SelectItem value="binary">Binary</SelectItem>}
                  {fromFormat !== "decimal" && <SelectItem value="decimal">Decimal</SelectItem>}
                  {fromFormat !== "hex" && <SelectItem value="hex">Hexadecimal</SelectItem>}
                </SelectContent>
              </Select>
            </div>
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
