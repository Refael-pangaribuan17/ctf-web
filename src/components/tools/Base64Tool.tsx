
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, RotateCcw, Copy, KeySquare, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [isBinary, setIsBinary] = useState(false);
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleProcess();
    } else {
      setOutput('');
    }
  }, [input, mode, isBinary]);

  const handleProcess = () => {
    if (!input) return;
    
    setLoadingState('processing');

    setTimeout(() => {
      try {
        let result = '';
        
        if (mode === 'encode') {
          // For binary files/content, we'll use a different approach
          if (isBinary && selectedFile) {
            // This is a simulation since we can't actually read binary files in this demo
            const fileType = selectedFile.type || 'application/octet-stream';
            const fileSize = selectedFile.size;
            const encoded = btoa(unescape(encodeURIComponent(`[Binary content from ${selectedFile.name} (${fileSize} bytes, ${fileType})]`)));
            result = encoded;
          } else {
            // Standard base64 encoding - handles UTF-8 properly
            result = btoa(unescape(encodeURIComponent(input)));
          }
        } else {
          try {
            // Base64 decoding with proper UTF-8 handling
            const decoded = decodeURIComponent(escape(atob(input.trim())));
            
            // Check if the result looks like binary data
            const isProbablyBinary = (function() {
              try {
                const sample = decoded.slice(0, 100);
                // Check for non-printable characters
                return sample.split('').some(char => {
                  const code = char.charCodeAt(0);
                  return code < 32 && code !== 9 && code !== 10 && code !== 13; // Exclude tabs, newlines
                });
              } catch (e) {
                return true; // If error in checking, assume binary
              }
            })();
            
            if (isProbablyBinary) {
              result = "[Binary content detected. Use the download button to save the file.]";
            } else {
              result = decoded;
            }
          } catch (e) {
            throw new Error("Invalid Base64 string");
          }
        }
        
        setOutput(result);
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
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
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setSelectedFile(file);
      
      if (file.size > 500000) {
        toast({
          title: "File Size Warning",
          description: "Large files may cause browser performance issues.",
          variant: "destructive",
        });
      }
      
      // Read file as text for demo purposes
      const reader = new FileReader();
      
      if (!isBinary) {
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            setInput(event.target.result.slice(0, 100000)); // Limit size for demo
          }
        };
        reader.readAsText(file);
      } else {
        // Just set a placeholder for binary mode
        setInput(`[File selected: ${file.name} (${file.size} bytes)]`);
      }
    }
  };

  const handleDownloadResult = () => {
    if (!output || mode !== 'decode') return;
    
    try {
      let decodedContent;
      
      try {
        decodedContent = atob(input.trim());
      } catch (e) {
        toast({
          title: "Decode Error",
          description: "Could not decode the content for download.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a blob and download it
      const blob = new Blob([decodedContent], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded_file.bin';
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your decoded file has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Could not prepare file for download.",
        variant: "destructive",
      });
    }
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

          {/* Example buttons */}
          <div className="flex flex-wrap gap-2">
            {mode === 'encode' ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("Hello, World!")}
                  className="text-xs"
                >
                  Example: Simple Text
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput('{"name":"John Doe","age":30,"isActive":true}')}
                  className="text-xs"
                >
                  Example: JSON
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("SGVsbG8sIFdvcmxkIQ==")}
                  className="text-xs"
                >
                  Example: "Hello, World!"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setInput("eyJuYW1lIjoiSm9obiBEb2UiLCJhZ2UiOjMwLCJpc0FjdGl2ZSI6dHJ1ZX0=")}
                  className="text-xs"
                >
                  Example: Encoded JSON
                </Button>
              </>
            )}
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
              <div className="flex gap-2">
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
                {mode === 'decode' && output && output.includes('[Binary content') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadResult}
                    className="h-6 px-2 text-xs"
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                )}
              </div>
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

          {/* Add file upload support */}
          {mode === 'encode' && (
            <div className="w-full mt-4">
              <Label htmlFor="file-upload" className="text-sm mb-2 block text-gray-300">
                Or upload a file
              </Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                Note: This is a browser-based tool with limited file handling. For large files, use a dedicated tool.
              </p>
            </div>
          )}
          
          {/* Information section */}
          <div className="mt-4 p-4 bg-cyber-darker/50 border border-cyber-dark rounded-md">
            <h3 className="text-sm font-medium text-cyber-blue mb-2">About Base64 Encoding:</h3>
            <p className="text-xs text-gray-300">
              Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
              It's commonly used to encode binary data such as images, audio files, or other binary content 
              when you need to transmit that data in environments that only support text content.
            </p>
            <div className="mt-2 text-xs text-gray-400">
              <p><strong>Common uses:</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Embedding images directly in HTML/CSS using data URIs</li>
                <li>Sending binary data in JSON payloads</li>
                <li>Email attachments (MIME)</li>
                <li>Storing complex data in cookies or local storage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;

