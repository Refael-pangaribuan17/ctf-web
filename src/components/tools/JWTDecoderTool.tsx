
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Copy, Braces, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const JWTDecoderTool: React.FC = () => {
  const [jwt, setJwt] = useState('');
  const [secret, setSecret] = useState('');
  const [header, setHeader] = useState<Record<string, any> | null>(null);
  const [payload, setPayload] = useState<Record<string, any> | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [expiryStatus, setExpiryStatus] = useState<'valid' | 'expired' | 'unknown'>('unknown');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (jwt) {
      handleDecode();
    } else {
      resetResults();
    }
  }, [jwt]);

  const resetResults = () => {
    setHeader(null);
    setPayload(null);
    setSignature(null);
    setIsValid(null);
    setExpiryStatus('unknown');
  };

  const handleDecode = () => {
    if (!jwt) return;
    
    setLoadingState('processing');
    
    // Simulate processing with timeout
    setTimeout(() => {
      try {
        const parts = jwt.split('.');
        
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        
        // Decode header (first part)
        const decodedHeader = JSON.parse(atob(parts[0]));
        setHeader(decodedHeader);
        
        // Decode payload (second part)
        const decodedPayload = JSON.parse(atob(parts[1]));
        setPayload(decodedPayload);
        
        // Set signature (we don't decode it, just store it)
        setSignature(parts[2]);
        
        // Check token expiry
        if (decodedPayload.exp) {
          const expiryDate = new Date(decodedPayload.exp * 1000);
          const now = new Date();
          
          if (expiryDate > now) {
            setExpiryStatus('valid');
          } else {
            setExpiryStatus('expired');
          }
        } else {
          setExpiryStatus('unknown');
        }
        
        setLoadingState('complete');
      } catch (error) {
        toast({
          title: "Decoding Error",
          description: "Failed to decode JWT. Make sure it's a valid token.",
          variant: "destructive",
        });
        resetResults();
        setLoadingState('idle');
      }
    }, 500);
  };

  const handleVerify = () => {
    if (!jwt) {
      toast({
        title: "No JWT",
        description: "Please enter a JWT to verify.",
        variant: "destructive",
      });
      return;
    }
    
    if (!secret) {
      toast({
        title: "No Secret",
        description: "Please enter a secret key to verify the JWT.",
        variant: "destructive",
      });
      return;
    }
    
    setLoadingState('processing');
    
    // Simulating verification with a timeout
    setTimeout(() => {
      // In a real implementation, we would use a JWT library to verify
      // Here we're just simulating the result
      const simulatedResult = Math.random() > 0.5;
      
      setIsValid(simulatedResult);
      setLoadingState('idle');
      
      toast({
        title: simulatedResult ? "Verification Successful" : "Verification Failed",
        description: simulatedResult 
          ? "JWT signature is valid." 
          : "JWT signature verification failed.",
        variant: simulatedResult ? "default" : "destructive",
      });
    }, 1000);
  };

  const handleCopy = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description,
    });
  };

  const handleReset = () => {
    setJwt('');
    setSecret('');
    resetResults();
    setLoadingState('idle');
  };

  const formatJSON = (obj: Record<string, any>): string => {
    return JSON.stringify(obj, null, 2);
  };

  const formatTimestamp = (timestamp: number): string => {
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
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              placeholder="Paste your JWT here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              className="font-mono resize-y min-h-[80px]"
            />
          </div>

          <Tabs defaultValue="decode" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="decode">Decode</TabsTrigger>
              <TabsTrigger value="verify">Verify</TabsTrigger>
            </TabsList>
            
            <TabsContent value="decode">
              {loadingState === 'processing' ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Decoding JWT...</div>
                </div>
              ) : header && payload ? (
                <div className="space-y-4">
                  {/* Header section */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-gray-300">
                        Header
                      </Label>
                      <Button
                        onClick={() => handleCopy(formatJSON(header), "Header copied to clipboard")}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-wrap">
                      {formatJSON(header)}
                    </div>
                  </div>
                  
                  {/* Payload section */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-gray-300">
                        Payload
                      </Label>
                      <Button
                        onClick={() => handleCopy(formatJSON(payload), "Payload copied to clipboard")}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-wrap">
                      {formatJSON(payload)}
                    </div>
                  </div>
                  
                  {/* Timestamp information if available */}
                  {(payload.exp || payload.iat || payload.nbf) && (
                    <div className="w-full">
                      <Label className="text-sm mb-2 block text-gray-300">
                        Timestamps
                      </Label>
                      <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                        <ul className="space-y-2">
                          {payload.iat && (
                            <li className="text-sm">
                              <span className="font-medium">Issued At:</span>{' '}
                              {formatTimestamp(payload.iat)}
                            </li>
                          )}
                          {payload.nbf && (
                            <li className="text-sm">
                              <span className="font-medium">Not Valid Before:</span>{' '}
                              {formatTimestamp(payload.nbf)}
                            </li>
                          )}
                          {payload.exp && (
                            <li className="text-sm">
                              <span className="font-medium">Expires At:</span>{' '}
                              {formatTimestamp(payload.exp)}{' '}
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                expiryStatus === 'valid' 
                                  ? 'bg-green-900/30 text-green-400'
                                  : expiryStatus === 'expired'
                                  ? 'bg-red-900/30 text-red-400'
                                  : 'bg-gray-900/30 text-gray-400'
                              }`}>
                                {expiryStatus === 'valid' 
                                  ? 'VALID' 
                                  : expiryStatus === 'expired' 
                                  ? 'EXPIRED' 
                                  : 'UNKNOWN'}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Signature section */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-gray-300">
                        Signature (encoded)
                      </Label>
                      <Button
                        onClick={() => handleCopy(signature || '', "Signature copied to clipboard")}
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md break-all">
                      {signature}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  Enter a JWT to decode it
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="verify">
              <div className="space-y-6">
                <div className="w-full">
                  <Label htmlFor="secret" className="text-sm mb-2 block text-gray-300">
                    Secret Key
                  </Label>
                  <Input
                    id="secret"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter secret key to verify JWT signature"
                    className="font-mono"
                    type="password"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the secret key that was used to sign the JWT.
                  </p>
                </div>
                
                <Button
                  onClick={handleVerify}
                  disabled={!jwt || !secret || loadingState === 'processing'}
                  className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
                >
                  {loadingState === 'processing' ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {loadingState === 'processing' ? "Verifying..." : "Verify Signature"}
                </Button>
                
                {isValid !== null && (
                  <div className={`w-full p-4 rounded-md flex items-center ${
                    isValid ? 'bg-green-900/20 border border-green-600/30' : 'bg-red-900/20 border border-red-600/30'
                  }`}>
                    {isValid ? (
                      <Check className="h-5 w-5 text-green-400 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    )}
                    <p className={isValid ? 'text-green-300' : 'text-red-300'}>
                      {isValid 
                        ? "Signature is valid! The JWT was signed with the provided secret." 
                        : "Signature verification failed. The JWT was not signed with the provided secret."}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default JWTDecoderTool;
