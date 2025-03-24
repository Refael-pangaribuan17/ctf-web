
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RotateCcw, Copy, Network, ArrowRight, AlertCircle } from 'lucide-react';
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
      
      let headersFetched = false;
      
      // Try different proxies in sequence until one works
      const proxies = [
        { name: 'CORS Anywhere', url: `https://cors-anywhere.herokuapp.com/${fullUrl}` },
        { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}` },
        { name: 'Corsproxy.io', url: `https://corsproxy.io/?${encodeURIComponent(fullUrl)}` }
      ];
      
      for (const proxy of proxies) {
        if (headersFetched) break;
        
        try {
          console.log(`Trying ${proxy.name}...`);
          const response = await fetch(proxy.url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
          });
          
          // Convert headers to an object
          const headersObj: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headersObj[key] = value;
          });
          
          // Add original URL request headers when available
          if (response.headers.has('x-final-url')) {
            headersObj['original-url'] = response.headers.get('x-final-url') || fullUrl;
          } else {
            headersObj['original-url'] = fullUrl;
          }
          
          if (response.headers.has('access-control-expose-headers')) {
            headersObj['access-control-expose-headers'] = response.headers.get('access-control-expose-headers') || '';
          }
          
          setHeaders(headersObj);
          
          // Create raw header display
          const rawHeadersText = Array.from(response.headers.entries())
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          setRawHeaders(rawHeadersText || 'No headers returned');
          headersFetched = true;
          
          toast({
            title: "Headers Retrieved",
            description: `Successfully retrieved headers via ${proxy.name}`,
          });
          
          break;
        } catch (proxyError) {
          console.error(`${proxy.name} failed:`, proxyError);
          // Continue to next proxy
        }
      }
      
      if (!headersFetched) {
        // Try direct fetch as last resort, which will likely fail due to CORS
        try {
          const response = await fetch(fullUrl, {
            method: 'HEAD',
            mode: 'no-cors' // This will result in an opaque response
          });
          
          // With no-cors we can't access the headers, but we can know if the resource exists
          toast({
            title: "Limited Information",
            description: "Resource exists, but detailed headers couldn't be retrieved due to CORS restrictions.",
            variant: "default"
          });
          
          setRawHeaders(`Resource at ${fullUrl} exists, but headers cannot be accessed due to CORS restrictions.
            
Try using a server-side tool or browser extension to view complete headers.`);
          
        } catch (directError) {
          throw new Error("All available methods to retrieve headers have failed");
        }
      }
    } catch (err) {
      console.error("Error fetching headers:", err);
      setError("Failed to retrieve headers. CORS restrictions prevented access to this URL's headers.");
      toast({
        title: "Inspection Failed",
        description: "CORS restrictions prevented access to this URL's headers. Try a different URL or use a server-side tool.",
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
              This tool uses proxy services to bypass CORS restrictions when fetching headers
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
            
            {rawHeaders && rawHeaders.includes("CORS restrictions") && (
              <div className="mt-4 p-3 border border-yellow-600/30 bg-yellow-900/20 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-yellow-400 mb-1">CORS Limitations</p>
                    <p>Due to browser security restrictions, retrieving headers from some sites might be limited. For comprehensive header analysis, consider using tools like cURL, Postman, or browser developer tools.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTTPHeaderTool;
