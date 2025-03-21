
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RotateCcw, Copy, Network, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HTTPHeaderTool: React.FC = () => {
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [rawHeaders, setRawHeaders] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInspect = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to inspect.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHeaders({});
    setRawHeaders('');

    try {
      // Ensure URL has protocol
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
      }

      // Try the cors-anywhere proxy first
      try {
        const corsResponse = await fetch(`https://cors-anywhere.herokuapp.com/${fullUrl}`, {
          method: 'HEAD',
        });
        
        // Convert headers to an object
        const headersObj: Record<string, string> = {};
        corsResponse.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
        
        setHeaders(headersObj);
        
        // Create raw header display
        const rawHeadersText = Array.from(corsResponse.headers.entries())
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        
        setRawHeaders(rawHeadersText);
        setIsLoading(false);
        return;
      } catch (corsError) {
        console.log("CORS Anywhere failed, trying allorigins:", corsError);
        // If cors-anywhere fails, try allorigins
      }

      // Fallback to AllOrigins
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(fullUrl)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status && data.status.http_code) {
        const headerEntries = Object.entries(data.status.headers || {});
        const headersObj: Record<string, string> = {};
        
        headerEntries.forEach(([key, value]) => {
          headersObj[key] = value as string;
        });
        
        setHeaders(headersObj);
        
        // Create raw header display
        const rawHeadersText = headerEntries
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        
        setRawHeaders(rawHeadersText);
      } else {
        throw new Error("Couldn't retrieve headers information");
      }
    } catch (err) {
      console.error("Error fetching headers:", err);
      setError("Failed to retrieve headers. Make sure the URL is correct and the site is accessible.");
      toast({
        title: "Inspection Failed",
        description: "Failed to retrieve headers. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rawHeaders) return;
    
    navigator.clipboard.writeText(rawHeaders);
    toast({
      title: "Copied to clipboard",
      description: "The headers have been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setUrl('');
    setHeaders({});
    setRawHeaders('');
    setError(null);
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Network className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">HTTP Header Inspector</h2>
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
          {/* URL input */}
          <div className="w-full">
            <Label htmlFor="url" className="text-sm mb-2 block text-gray-300">
              URL to Inspect
            </Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g., example.com)"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleInspect} 
                disabled={isLoading}
                className="bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full" />
                ) : (
                  <>
                    <ArrowRight className="mr-1 h-4 w-4" />
                    Inspect
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Note: This tool uses proxies to retrieve headers from websites while avoiding CORS issues
            </p>
          </div>

          {/* Results display */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="headers" className="text-sm text-gray-300">
                HTTP Headers
              </Label>
              {rawHeaders && (
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
              className={`relative font-mono min-h-[200px] p-4 rounded-md bg-cyber-darker border border-cyber-dark transition-all duration-300 overflow-auto`}
            >
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Inspecting headers...</div>
                </div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : rawHeaders ? (
                <pre className="whitespace-pre-wrap break-all text-sm">{rawHeaders}</pre>
              ) : (
                <div className="text-gray-400">
                  Headers will appear here after inspection...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTTPHeaderTool;
