
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Wifi, Play, Search, FileSearch, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Network = {
  ssid: string;
  bssid: string;
  channel: number;
  signal: number;
  security: string;
  clients: number;
};

type HandshakeCapture = {
  id: string;
  ssid: string;
  bssid: string;
  timestamp: string;
  status: 'captured' | 'analyzing' | 'cracked';
  password?: string;
};

const WifiAnalyzerTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [captures, setCaptures] = useState<HandshakeCapture[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [dictionaryFile, setDictionaryFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    setIsScanning(true);
    setNetworks([]);
    
    // Simulate network scanning
    setTimeout(() => {
      const fakeNetworks: Network[] = [
        {
          ssid: "HomeNetwork",
          bssid: "00:11:22:33:44:55",
          channel: 6,
          signal: -45,
          security: "WPA2",
          clients: 3
        },
        {
          ssid: "Office_WiFi",
          bssid: "AA:BB:CC:DD:EE:FF",
          channel: 11,
          signal: -60,
          security: "WPA2-Enterprise",
          clients: 8
        },
        {
          ssid: "GuestNetwork",
          bssid: "12:34:56:78:90:AB",
          channel: 1,
          signal: -70,
          security: "WPA2",
          clients: 1
        },
        {
          ssid: "CoffeeShop",
          bssid: "98:76:54:32:10:FE",
          channel: 3,
          signal: -55,
          security: "WPA2",
          clients: 5
        },
        {
          ssid: "PublicWiFi",
          bssid: "FE:DC:BA:98:76:54",
          channel: 9,
          signal: -75,
          security: "Open",
          clients: 12
        }
      ];
      
      setNetworks(fakeNetworks);
      setIsScanning(false);
      
      toast({
        title: "Scan Complete",
        description: `Found ${fakeNetworks.length} networks in range.`,
      });
    }, 3000);
  };

  const handleCapture = () => {
    if (!selectedNetwork) return;
    
    setIsCapturing(true);
    setCaptureProgress(0);
    
    // Simulate handshake capture with progress updates
    const interval = setInterval(() => {
      setCaptureProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Add the captured handshake to the list
          const newCapture: HandshakeCapture = {
            id: Date.now().toString(),
            ssid: selectedNetwork.ssid,
            bssid: selectedNetwork.bssid,
            timestamp: new Date().toLocaleString(),
            status: 'captured'
          };
          
          setCaptures(prev => [...prev, newCapture]);
          setIsCapturing(false);
          
          toast({
            title: "Handshake Captured",
            description: `Successfully captured handshake for ${selectedNetwork.ssid}.`,
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleAnalyze = (capture: HandshakeCapture) => {
    if (isAnalyzing) return;
    
    if (!dictionaryFile) {
      toast({
        title: "Dictionary Required",
        description: "Please upload a dictionary file for password cracking.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Update status to analyzing
    setCaptures(prev => prev.map(c => 
      c.id === capture.id ? { ...c, status: 'analyzing' } : c
    ));
    
    // Simulate password cracking
    setTimeout(() => {
      // 50% chance of success for demonstration
      const success = Math.random() > 0.5;
      
      if (success) {
        const commonPasswords = ["password123", "admin123", "letmein", "wifi123", "12345678"];
        const password = commonPasswords[Math.floor(Math.random() * commonPasswords.length)];
        
        setCaptures(prev => prev.map(c => 
          c.id === capture.id ? { ...c, status: 'cracked', password } : c
        ));
        
        toast({
          title: "Password Cracked",
          description: `Password for ${capture.ssid}: ${password}`,
        });
      } else {
        setCaptures(prev => prev.map(c => 
          c.id === capture.id ? { ...c, status: 'captured' } : c
        ));
        
        toast({
          title: "Cracking Failed",
          description: "Could not crack the password with the provided dictionary.",
          variant: "destructive",
        });
      }
      
      setIsAnalyzing(false);
    }, 5000);
  };

  const handleReset = () => {
    setIsScanning(false);
    setNetworks([]);
    setSelectedNetwork(null);
    setCaptures([]);
    setIsCapturing(false);
    setCaptureProgress(0);
    setDictionaryFile(null);
    setIsAnalyzing(false);
  };

  const getSignalStrengthColor = (signal: number) => {
    if (signal > -50) return "bg-green-500";
    if (signal > -70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Wifi className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">WiFi Analyzer</h2>
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

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="scan">Network Scanner</TabsTrigger>
            <TabsTrigger value="handshake">Handshake Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="space-y-6">
            <div className="w-full">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan for Networks
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 mt-1">
                This will scan for nearby WiFi networks in monitor mode (simulation only).
              </p>
            </div>
            
            {networks.length > 0 && (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Detected Networks
                </Label>
                <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cyber-dark/50">
                        <th className="px-4 py-2 text-left">SSID</th>
                        <th className="px-4 py-2 text-left">BSSID</th>
                        <th className="px-4 py-2 text-center">CH</th>
                        <th className="px-4 py-2 text-center">Signal</th>
                        <th className="px-4 py-2 text-left">Security</th>
                        <th className="px-4 py-2 text-center">Clients</th>
                        <th className="px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {networks.map((network, index) => (
                        <tr 
                          key={network.bssid} 
                          className={`border-t border-cyber-dark/50 ${
                            selectedNetwork?.bssid === network.bssid ? 'bg-cyber-blue/10' : ''
                          } hover:bg-cyber-dark/30 cursor-pointer`}
                          onClick={() => setSelectedNetwork(network)}
                        >
                          <td className="px-4 py-2">{network.ssid}</td>
                          <td className="px-4 py-2 font-mono text-xs">{network.bssid}</td>
                          <td className="px-4 py-2 text-center">{network.channel}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-center">
                              <div className="w-16 bg-gray-700 rounded-full h-1.5 mr-2">
                                <div 
                                  className={`h-1.5 rounded-full ${getSignalStrengthColor(network.signal)}`} 
                                  style={{ width: `${Math.min(100, (100 + network.signal) * 1.5)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{network.signal} dBm</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">{network.security}</td>
                          <td className="px-4 py-2 text-center">{network.clients}</td>
                          <td className="px-4 py-2 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNetwork(network);
                              }}
                            >
                              Select
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {selectedNetwork && (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Selected Network
                </Label>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{selectedNetwork.ssid}</h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">{selectedNetwork.bssid}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{selectedNetwork.security}</div>
                      <div className="text-xs text-gray-400 mt-1">Channel {selectedNetwork.channel}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Button
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="bg-cyber-blue hover:bg-cyber-blue/80"
                    >
                      {isCapturing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                          Capturing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Capture Handshake
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNetwork(null)}
                    >
                      Deselect Network
                    </Button>
                  </div>
                  
                  {isCapturing && (
                    <div className="mt-4">
                      <div className="text-xs text-gray-400 mb-1">Capturing handshake: {captureProgress}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-cyber-blue" 
                          style={{ width: `${captureProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Waiting for clients to connect/reconnect to capture authentication handshake...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="handshake" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="dictionary" className="text-sm mb-2 block text-gray-300">
                Upload Dictionary File
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dictionary"
                  type="file"
                  onChange={(e) => setDictionaryFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {dictionaryFile && (
                  <Button variant="outline" size="sm" onClick={() => setDictionaryFile(null)}>
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload a wordlist file for password cracking (e.g., rockyou.txt)
              </p>
            </div>
            
            {captures.length > 0 ? (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Captured Handshakes
                </Label>
                <div className="space-y-3">
                  {captures.map((capture) => (
                    <div 
                      key={capture.id} 
                      className="bg-cyber-darker border border-cyber-dark rounded-md p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{capture.ssid}</h3>
                          <p className="text-xs text-gray-400 font-mono mt-1">{capture.bssid}</p>
                          <p className="text-xs text-gray-400 mt-1">Captured: {capture.timestamp}</p>
                        </div>
                        <div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            capture.status === 'cracked' 
                              ? 'bg-green-900/30 text-green-400 border border-green-500/50' 
                              : capture.status === 'analyzing'
                                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
                                : 'bg-gray-900/30 text-gray-400 border border-gray-500/50'
                          }`}>
                            {capture.status === 'cracked' 
                              ? 'Cracked' 
                              : capture.status === 'analyzing'
                                ? 'Analyzing...'
                                : 'Captured'}
                          </div>
                        </div>
                      </div>
                      
                      {capture.status === 'cracked' && capture.password && (
                        <div className="mt-3 p-2 bg-green-900/20 border border-green-500/30 rounded">
                          <div className="text-xs text-gray-300">Password:</div>
                          <div className="font-mono text-green-400 mt-1">{capture.password}</div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleAnalyze(capture)}
                          disabled={!dictionaryFile || capture.status === 'analyzing' || capture.status === 'cracked' || isAnalyzing}
                          className={`flex-1 ${capture.status === 'cracked' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-cyber-blue hover:bg-cyber-blue/80'}`}
                        >
                          {capture.status === 'analyzing' ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                              Analyzing...
                            </>
                          ) : capture.status === 'cracked' ? (
                            <>
                              <FileSearch className="h-4 w-4 mr-2" />
                              Already Cracked
                            </>
                          ) : (
                            <>
                              <FileSearch className="h-4 w-4 mr-2" />
                              Crack Password
                            </>
                          )}
                        </Button>
                        
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full p-8 bg-cyber-darker border border-cyber-dark rounded-md text-center">
                <Wifi className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-400">No Handshakes Captured</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Go to the Network Scanner tab to scan for networks and capture handshakes.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WifiAnalyzerTool;
