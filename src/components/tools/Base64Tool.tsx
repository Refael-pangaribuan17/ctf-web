
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, KeySquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [isBinary, setIsBinary] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleProcess();
    }
  }, [input, mode, isBinary]);

  const handleProcess = () => {
    if (!input) return;
    
    setLoadingState('processing');

    setTimeout(() => {
      try {
        let result = '';
        
        if (mode === 'encode') {
          // For binary files/content, we'd need FileReader in a real implementation
          if (isBinary) {
            // This is just a simulation for the UI
            const bytes = new TextEncoder().encode(input);
            result = btoa(String.fromCharCode(...bytes));
          } else {
            result = btoa(input);
          }
        } else {
          try {
            const decoded = atob(input);
            result = decoded;
          } catch (e) {
            throw new Error("Invalid Base64 string");
          }
        }
        
        setOutput(result);
        setLoadingState('complete');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Processing Error",
          description: errorMessage,
          variant: "destructive",
        });
        setOutput('');
        setLoadingState('idle');
        return;
      }
      
      // Reset complete state after a moment
      setTimeout(() => {
        setLoadingState('idle');
      }, 500);
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
    setIsBinary(false);
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <KeySquare className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Base64 Encoder/Decoder</h2>
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

          {/* Binary option for encoding */}
          {mode === 'encode' && (
            <div className="flex items-center space-x-2">
              <input
                id="binary-mode"
                type="checkbox"
                checked={isBinary}
                onChange={(e) => setIsBinary(e.target.checked)}
                className="rounded border-gray-300 text-cyber-blue focus:ring-cyber-blue h-4 w-4"
              />
              <Label htmlFor="binary-mode" className="text-sm text-gray-300">
                Treat input as binary data
              </Label>
            </div>
          )}

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? "Enter text to encode to Base64..." : "Enter Base64 string to decode..."}
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

          {/* Add file upload support for real binary data */}
          {mode === 'encode' && isBinary && (
            <div className="w-full mt-4">
              <Label htmlFor="file-upload" className="text-sm mb-2 block text-gray-300">
                Or upload a file (experimental)
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        // For demo purposes only - in reality we'd use readAsArrayBuffer
                        // and handle binary data properly
                        setInput(`[Binary file: ${file.name}]`);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                Note: This is a frontend demo with limited binary handling. For large files, use a dedicated tool.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;
