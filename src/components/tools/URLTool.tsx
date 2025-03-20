
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const URLTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

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
      try {
        let result = '';
        
        if (mode === 'encode') {
          result = encodeURIComponent(input);
        } else {
          // Catch potential decode errors
          try {
            result = decodeURIComponent(input);
          } catch (e) {
            throw new Error("Invalid URL-encoded string. Make sure your input contains valid URL encoding.");
          }
        }
        
        setOutput(result);
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Invalid input for the selected operation.";
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
    setMode('encode');
  };

  const exampleEncodeClick = () => {
    setInput("https://example.com/path?name=John Doe&age=25");
    setMode('encode');
  };
  
  const exampleDecodeClick = () => {
    setInput("https%3A%2F%2Fexample.com%2Fpath%3Fname%3DJohn%20Doe%26age%3D25");
    setMode('decode');
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Globe className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">URL Encoder/Decoder</h2>
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

          {/* Examples */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exampleEncodeClick}
              className="text-xs"
            >
              Example: Encode URL
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exampleDecodeClick}
              className="text-xs"
            >
              Example: Decode URL
            </Button>
          </div>

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' 
                ? "Enter text to encode to URL format..." 
                : "Enter URL-encoded text to decode..."
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
          
          {/* How it works section */}
          <div className="mt-4 p-4 bg-cyber-darker/50 border border-cyber-dark rounded-md">
            <h3 className="text-sm font-medium text-cyber-blue mb-2">How URL Encoding Works:</h3>
            <p className="text-xs text-gray-300">
              URL encoding replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits. 
              For example, space is encoded as %20. This encoding is used for query parameters and other 
              parts of URLs that may contain special characters.
            </p>
            <div className="mt-2 text-xs text-gray-400">
              <div><strong>Common encodings:</strong></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                <div>Space → %20</div>
                <div>! → %21</div>
                <div># → %23</div>
                <div>$ → %24</div>
                <div>% → %25</div>
                <div>& → %26</div>
                <div>= → %3D</div>
                <div>? → %3F</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default URLTool;
