
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Copy, Braces, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const JWTDecoderTool: React.FC = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState<Record<string, any> | null>(null);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      handleDecode();
    } else {
      resetResults();
    }
  }, [token]);

  const resetResults = () => {
    setHeader(null);
    setPayload(null);
    setSignature(null);
    setError(null);
  };

  const handleDecode = () => {
    resetResults();
    setLoadingState('processing');

    setTimeout(() => {
      try {
        const parts = token.trim().split('.');
        
        if (parts.length !== 3) {
          throw new Error("Invalid JWT format. A valid JWT should have three parts separated by dots.");
        }
        
        // Decode header
        try {
          const decodedHeader = JSON.parse(atob(parts[0]));
          setHeader(decodedHeader);
        } catch (e) {
          throw new Error("Invalid JWT header. Could not parse the decoded header as JSON.");
        }
        
        // Decode payload
        try {
          const decodedPayload = JSON.parse(atob(parts[1]));
          setPayload(decodedPayload);
        } catch (e) {
          throw new Error("Invalid JWT payload. Could not parse the decoded payload as JSON.");
        }
        
        // Show signature (can't validate without knowing the secret)
        setSignature(parts[2]);
        
        setLoadingState('complete');
        
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (err) {
        setError((err as Error).message || "Failed to decode JWT");
        setLoadingState('idle');
        toast({
          title: "Decoding Error",
          description: (err as Error).message || "Failed to decode JWT",
          variant: "destructive",
        });
      }
    }, 300);
  };

  const prettyPrint = (obj: Record<string, any>) => {
    return JSON.stringify(obj, null, 2);
  };

  const handleCopy = (section: 'header' | 'payload' | 'all') => {
    let textToCopy = '';
    
    if (section === 'header' && header) {
      textToCopy = prettyPrint(header);
    } else if (section === 'payload' && payload) {
      textToCopy = prettyPrint(payload);
    } else if (section === 'all') {
      const allData = {
        header: header,
        payload: payload,
        signature: signature
      };
      textToCopy = prettyPrint(allData);
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: `The ${section === 'all' ? 'JWT data' : section} has been copied to your clipboard.`,
      });
    }
  };

  const handleReset = () => {
    setToken('');
    resetResults();
  };

  // Verify if a token has expired
  const isTokenExpired = () => {
    if (payload && payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    }
    return false;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Braces className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">JWT Decoder</h2>
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
          <div className="w-full">
            <Label htmlFor="jwt" className="text-sm mb-2 block text-gray-300">
              JSON Web Token
            </Label>
            <Textarea
              id="jwt"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1...)"
              className="font-mono resize-y min-h-[100px]"
            />
            <p className="text-xs text-gray-400 mt-1">
              JWT consists of three parts separated by dots: header.payload.signature
            </p>
          </div>
          
          {error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 rounded-md p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400">Decoding Error</h4>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          )}
          
          {(header || payload) && (
            <div className="space-y-4">
              {/* Header section */}
              {header && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      Header
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy('header')}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {prettyPrint(header)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Payload section */}
              {payload && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      Payload
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy('payload')}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                    {payload.exp && (
                      <div className={`mb-3 text-xs p-2 rounded-md ${isTokenExpired() ? 'bg-red-900/30 border border-red-500/50' : 'bg-green-900/30 border border-green-500/50'}`}>
                        <span className="font-medium">{isTokenExpired() ? 'Token has expired' : 'Token is valid'}</span>
                        <div className="mt-1">
                          Expiration: {formatTime(payload.exp)}
                        </div>
                      </div>
                    )}
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {prettyPrint(payload)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Signature section */}
              {signature && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      Signature (encoded)
                    </Label>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                    <p className="text-xs text-gray-400 mb-2">
                      The signature is used to verify the message wasn't changed along the way. To verify the signature, you would need the secret key used to sign the token.
                    </p>
                    <div className="font-mono text-xs text-gray-300 break-all">
                      {signature}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Copy all button */}
              <Button
                variant="default"
                onClick={() => handleCopy('all')}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Data
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JWTDecoderTool;
