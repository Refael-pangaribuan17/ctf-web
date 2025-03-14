
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Copy, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

const HashGeneratorTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleGenerateHash();
    } else {
      setOutput('');
    }
  }, [input, algorithm]);

  const handleGenerateHash = async () => {
    if (!input) return;
    
    setLoadingState('processing');

    // Simulate processing delay for visual effect
    setTimeout(async () => {
      try {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(input);
        
        let hashBuffer;
        
        switch (algorithm) {
          case 'md5':
            // Since Web Crypto API doesn't support MD5, we'll use a placeholder
            // In a real app, you'd use a library like CryptoJS
            setOutput('MD5 would be generated here');
            break;
          case 'sha1':
            // Same for SHA-1
            setOutput('SHA-1 would be generated here');
            break;
          case 'sha256':
            hashBuffer = await crypto.subtle.digest('SHA-256', data);
            break;
          case 'sha512':
            hashBuffer = await crypto.subtle.digest('SHA-512', data);
            break;
        }
        
        if (hashBuffer) {
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          setOutput(hashHex);
        }
        
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (error) {
        toast({
          title: "Processing Error",
          description: "Failed to generate hash.",
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
      description: "The hash has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setAlgorithm('md5');
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Shield className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Hash Generator</h2>
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
          {/* Algorithm selection */}
          <div className="w-full">
            <Label htmlFor="algorithm" className="text-sm mb-2 block text-gray-300">
              Hash Algorithm
            </Label>
            <ToggleGroup
              type="single"
              value={algorithm}
              onValueChange={(value) => value && setAlgorithm(value as HashAlgorithm)}
              className="w-full justify-start border border-border rounded-md overflow-hidden p-1"
            >
              <ToggleGroupItem value="md5" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                MD5
              </ToggleGroupItem>
              <ToggleGroupItem value="sha1" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-1
              </ToggleGroupItem>
              <ToggleGroupItem value="sha256" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-256
              </ToggleGroupItem>
              <ToggleGroupItem value="sha512" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-512
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              Text to Hash
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to generate hash..."
              className="font-mono resize-y min-h-[100px]"
            />
          </div>

          {/* Output display */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="output" className="text-sm text-gray-300">
                Hash Result
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
              className={`relative font-mono min-h-[80px] p-4 rounded-md bg-cyber-darker border border-cyber-dark transition-all duration-300 overflow-auto ${
                loadingState === 'processing' ? 'bg-cyber-dark/50' : ''
              }`}
            >
              {loadingState === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Generating hash...</div>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 break-all ${output ? 'opacity-100' : 'opacity-50'}`}>
                  {output || "Hash will appear here..."}
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

export default HashGeneratorTool;
