
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Wifi, Play, Search, FileSearch, Download, Info, Zap, AlertTriangle, Terminal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Network = {
  ssid: string;
  bssid: string;
  channel: number;
  frequency: string;
  signal: number;
  security: string;
  clients: number;
  wps: boolean;
  vendor: string;
  firstSeen: string;
  lastSeen: string;
};

type HandshakeCapture = {
  id: string;
  ssid: string;
  bssid: string;
  timestamp: string;
  status: 'captured' | 'analyzing' | 'cracked';
  password?: string;
  captureMethod: string;
  eapolCount: number;
  fileSize: string;
  filePath: string;
};

const FREQUENCY_BANDS = {
  1: "2.412 GHz (2.4 GHz)",
  2: "2.417 GHz (2.4 GHz)",
  3: "2.422 GHz (2.4 GHz)",
  4: "2.427 GHz (2.4 GHz)",
  5: "2.432 GHz (2.4 GHz)",
  6: "2.437 GHz (2.4 GHz)",
  7: "2.442 GHz (2.4 GHz)",
  8: "2.447 GHz (2.4 GHz)",
  9: "2.452 GHz (2.4 GHz)",
  10: "2.457 GHz (2.4 GHz)",
  11: "2.462 GHz (2.4 GHz)",
  12: "2.467 GHz (2.4 GHz)",
  13: "2.472 GHz (2.4 GHz)",
  36: "5.180 GHz (5 GHz)",
  40: "5.200 GHz (5 GHz)",
  44: "5.220 GHz (5 GHz)",
  48: "5.240 GHz (5 GHz)",
  52: "5.260 GHz (5 GHz)",
  56: "5.280 GHz (5 GHz)",
  60: "5.300 GHz (5 GHz)",
  64: "5.320 GHz (5 GHz)",
  100: "5.500 GHz (5 GHz)",
  104: "5.520 GHz (5 GHz)",
  108: "5.540 GHz (5 GHz)",
  112: "5.560 GHz (5 GHz)",
  116: "5.580 GHz (5 GHz)",
  120: "5.600 GHz (5 GHz)",
  124: "5.620 GHz (5 GHz)",
  128: "5.640 GHz (5 GHz)",
  132: "5.660 GHz (5 GHz)",
  136: "5.680 GHz (5 GHz)",
  140: "5.700 GHz (5 GHz)",
  149: "5.745 GHz (5 GHz)",
  153: "5.765 GHz (5 GHz)",
  157: "5.785 GHz (5 GHz)",
  161: "5.805 GHz (5 GHz)",
  165: "5.825 GHz (5 GHz)",
};

const WIFI_VENDORS = [
  "Cisco Systems", "Netgear", "TP-Link", "D-Link", "ASUS", 
  "Linksys", "Ubiquiti Networks", "Belkin", "Apple", "Samsung", 
  "Huawei", "Xiaomi", "Aruba Networks", "Ruckus Wireless", "Mikrotik"
];

const WifiAnalyzerTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [captures, setCaptures] = useState<HandshakeCapture[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [dictionaryFile, setDictionaryFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanPrompt, setScanPrompt] = useState(
    "Lakukan pemindaian jaringan WiFi dalam mode monitor untuk menangkap semua SSID yang tersedia beserta informasi teknisnya, termasuk SSID (nama WiFi), BSSID (MAC Address AP), kekuatan sinyal (dBm), kanal frekuensi (2.4GHz / 5GHz), dan tipe keamanan (WEP/WPA/WPA2/WPA3). Pastikan hasil pemindaian ditampilkan dalam format yang mudah dianalisis."
  );
  const [handshakePrompt, setHandshakePrompt] = useState(
    "Tangkap dan analisis handshake WPA/WPA2 dari jaringan WiFi target menggunakan mode monitor. Pilih target berdasarkan SSID atau BSSID tertentu, lalu simpan file handshake dalam format .cap untuk analisis lebih lanjut. Gunakan filter untuk menangkap hanya paket EAPOL dan mencegah kebisingan data. Jika diperlukan, gunakan teknik deauthentication untuk mempercepat proses handshake capture, dan tampilkan hasil tangkapan secara real-time."
  );
  const [scanMode, setScanMode] = useState<'passive' | 'active'>('passive');
  const [useDeauth, setUseDeauth] = useState(false);
  const [deauthCount, setDeauthCount] = useState(5);
  const [captureTimeout, setCaptureTimeout] = useState(30);
  const [filterBand, setFilterBand] = useState<'all' | '2.4' | '5'>('all');
  const [interfaceMode, setInterfaceMode] = useState<'managed' | 'monitor'>('monitor');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  
  const { toast } = useToast();

  const getFrequencyBand = (channel: number) => {
    return FREQUENCY_BANDS[channel as keyof typeof FREQUENCY_BANDS] || 
      (channel < 14 ? `${(2.407 + channel * 0.005).toFixed(3)} GHz (2.4 GHz)` : 
       channel < 36 ? "Unknown" : `${(5.000 + channel * 0.005).toFixed(3)} GHz (5 GHz)`);
  };

  const getRandomVendor = () => {
    return WIFI_VENDORS[Math.floor(Math.random() * WIFI_VENDORS.length)];
  };

  const handleScan = () => {
    setIsScanning(true);
    setNetworks([]);
    setLastCommand(`sudo airodump-ng ${interfaceMode === 'monitor' ? 'wlan0mon' : 'wlan0'} ${filterBand === '2.4' ? '--band a' : filterBand === '5' ? '--band bg' : ''} ${scanMode === 'passive' ? '' : '--transmit'}`);
    
    // Simulate network scanning
    setTimeout(() => {
      const currentTime = new Date().toLocaleTimeString();
      
      const fakeNetworks: Network[] = [
        {
          ssid: "HomeNetwork",
          bssid: "00:11:22:33:44:55",
          channel: 6,
          frequency: getFrequencyBand(6),
          signal: -45,
          security: "WPA2",
          clients: 3,
          wps: false,
          vendor: "Netgear",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "Office_WiFi",
          bssid: "AA:BB:CC:DD:EE:FF",
          channel: 11,
          frequency: getFrequencyBand(11),
          signal: -60,
          security: "WPA2-Enterprise",
          clients: 8,
          wps: false,
          vendor: "Cisco Systems",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "GuestNetwork",
          bssid: "12:34:56:78:90:AB",
          channel: 1,
          frequency: getFrequencyBand(1),
          signal: -70,
          security: "WPA2",
          clients: 1,
          wps: true,
          vendor: "TP-Link",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "CoffeeShop",
          bssid: "98:76:54:32:10:FE",
          channel: 3,
          frequency: getFrequencyBand(3),
          signal: -55,
          security: "WPA2",
          clients: 5,
          wps: false,
          vendor: "Ubiquiti Networks",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "PublicWiFi",
          bssid: "FE:DC:BA:98:76:54",
          channel: 9,
          frequency: getFrequencyBand(9),
          signal: -75,
          security: "Open",
          clients: 12,
          wps: false,
          vendor: "Aruba Networks",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "5G_Home_Network",
          bssid: "A1:B2:C3:D4:E5:F6",
          channel: 36,
          frequency: getFrequencyBand(36),
          signal: -62,
          security: "WPA3",
          clients: 2,
          wps: false,
          vendor: "ASUS",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "IoT_Network",
          bssid: "11:22:33:44:55:66",
          channel: 2,
          frequency: getFrequencyBand(2),
          signal: -58,
          security: "WPA2",
          clients: 15,
          wps: true,
          vendor: "Xiaomi",
          firstSeen: currentTime,
          lastSeen: currentTime
        },
        {
          ssid: "Hidden_Network",
          bssid: "77:88:99:AA:BB:CC",
          channel: 149,
          frequency: getFrequencyBand(149),
          signal: -68,
          security: "WPA2/WPA3",
          clients: 1,
          wps: false,
          vendor: "Mikrotik",
          firstSeen: currentTime,
          lastSeen: currentTime
        }
      ];
      
      // Apply frequency band filter if set
      const filteredNetworks = fakeNetworks.filter(network => {
        if (filterBand === 'all') return true;
        if (filterBand === '2.4' && network.channel <= 14) return true;
        if (filterBand === '5' && network.channel > 14) return true;
        return false;
      });
      
      setNetworks(filteredNetworks);
      setIsScanning(false);
      
      toast({
        title: "Scan Complete",
        description: `Found ${filteredNetworks.length} networks in range.`,
      });
    }, 3000);
  };

  const handleCapture = () => {
    if (!selectedNetwork) return;
    
    setIsCapturing(true);
    setCaptureProgress(0);
    
    // Generate command based on options
    const deauthOption = useDeauth ? `-c ${deauthCount}` : '';
    const command = `sudo airodump-ng -c ${selectedNetwork.channel} --bssid ${selectedNetwork.bssid} -w capture_${selectedNetwork.ssid.replace(/[^a-zA-Z0-9]/g, '_')} ${interfaceMode === 'monitor' ? 'wlan0mon' : 'wlan0'} ${deauthOption}`;
    setLastCommand(command);
    
    // Simulate handshake capture with progress updates
    const interval = setInterval(() => {
      setCaptureProgress(prev => {
        const newProgress = prev + (useDeauth ? 15 : 10);
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Add the captured handshake to the list
          const fileSize = `${Math.floor(Math.random() * 20) + 5}KB`;
          const eapolCount = Math.floor(Math.random() * 4) + 1;
          const newCapture: HandshakeCapture = {
            id: Date.now().toString(),
            ssid: selectedNetwork.ssid,
            bssid: selectedNetwork.bssid,
            timestamp: new Date().toLocaleString(),
            status: 'captured',
            captureMethod: useDeauth ? 'Targeted Deauthentication' : 'Passive Monitoring',
            eapolCount: eapolCount,
            fileSize: fileSize,
            filePath: `/tmp/capture_${selectedNetwork.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.cap`
          };
          
          setCaptures(prev => [...prev, newCapture]);
          setIsCapturing(false);
          
          toast({
            title: "Handshake Captured",
            description: `Successfully captured handshake for ${selectedNetwork.ssid} with ${eapolCount} EAPOL frames.`,
          });
          
          return 100;
        }
        return newProgress;
      });
    }, useDeauth ? 400 : 800);
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
    
    // Generate command
    const command = `hashcat -m 22000 ${capture.filePath} ${dictionaryFile.name} -r rules/best64.rule --force`;
    setLastCommand(command);
    
    // Simulate password cracking
    setTimeout(() => {
      // 50% chance of success for demonstration
      const success = Math.random() > 0.5;
      
      if (success) {
        const commonPasswords = ["password123", "admin123", "letmein", "wifi123", "12345678", "qwerty123", "1q2w3e4r", "welcome1", "sunshine", "iloveyou"];
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
    setLastCommand("");
  };

  const getSignalStrengthColor = (signal: number) => {
    if (signal > -50) return "bg-green-500";
    if (signal > -70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSignalStrengthText = (signal: number) => {
    if (signal > -50) return "Excellent";
    if (signal > -60) return "Good";
    if (signal > -70) return "Fair";
    if (signal > -80) return "Poor";
    return "Very Poor";
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Wifi className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">WiFi Analyzer</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mr-2"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  {showAdvancedOptions ? "Hide" : "Advanced"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle advanced scanning options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
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
            {showAdvancedOptions && (
              <div className="bg-cyber-darker border border-cyber-dark rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Advanced Scan Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scanMode">Scan Mode</Label>
                    <Select 
                      value={scanMode} 
                      onValueChange={(value) => setScanMode(value as 'passive' | 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scan mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passive">Passive (Undetectable)</SelectItem>
                        <SelectItem value="active">Active (Faster, Detectable)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Passive mode only listens; active sends probe requests
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filterBand">Frequency Band</Label>
                    <Select 
                      value={filterBand} 
                      onValueChange={(value) => setFilterBand(value as 'all' | '2.4' | '5')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency band" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bands</SelectItem>
                        <SelectItem value="2.4">2.4 GHz Only</SelectItem>
                        <SelectItem value="5">5 GHz Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Filter networks by frequency band
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interfaceMode">Interface Mode</Label>
                    <Select 
                      value={interfaceMode} 
                      onValueChange={(value) => setInterfaceMode(value as 'managed' | 'monitor')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interface mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monitor">Monitor Mode</SelectItem>
                        <SelectItem value="managed">Managed Mode (Limited)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Monitor mode required for full analysis
                    </p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <Textarea 
                      placeholder="Custom scan command..." 
                      value={scanPrompt}
                      onChange={(e) => setScanPrompt(e.target.value)}
                      className="h-24 font-mono text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Natural language prompt for scan operation
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    Scanning Networks...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan for WiFi Networks
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 mt-1">
                This will scan for nearby WiFi networks in {interfaceMode} mode{scanMode === 'passive' ? ' (passive)' : ' (active)'}.
              </p>
            </div>
            
            {lastCommand && (
              <div className="w-full font-mono text-xs bg-black/50 rounded-md p-3 border border-gray-700 overflow-x-auto">
                <div className="flex items-center mb-1">
                  <Terminal className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                  <span className="text-green-500">Command:</span>
                </div>
                <code className="text-gray-300">{lastCommand}</code>
              </div>
            )}
            
            {networks.length > 0 && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Detected Networks ({networks.length})
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {filterBand === 'all' ? 'All Bands' : filterBand === '2.4' ? '2.4 GHz Only' : '5 GHz Only'}
                  </Badge>
                </div>
                <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-cyber-dark/50">
                          <th className="px-4 py-2 text-left">SSID</th>
                          <th className="px-4 py-2 text-left">BSSID</th>
                          <th className="px-4 py-2 text-center">CH</th>
                          <th className="px-4 py-2 text-left">Frequency</th>
                          <th className="px-4 py-2 text-center">Signal</th>
                          <th className="px-4 py-2 text-left">Security</th>
                          <th className="px-4 py-2 text-center">Clients</th>
                          <th className="px-4 py-2 text-center">WPS</th>
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
                            <td className="px-4 py-2 text-xs">{network.frequency}</td>
                            <td className="px-4 py-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center">
                                      <div className="w-16 bg-gray-700 rounded-full h-1.5 mr-2">
                                        <div 
                                          className={`h-1.5 rounded-full ${getSignalStrengthColor(network.signal)}`} 
                                          style={{ width: `${Math.min(100, (100 + network.signal) * 1.5)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs">{network.signal} dBm</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getSignalStrengthText(network.signal)} Signal</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </td>
                            <td className="px-4 py-2">{network.security}</td>
                            <td className="px-4 py-2 text-center">{network.clients}</td>
                            <td className="px-4 py-2 text-center">
                              {network.wps ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <span className="text-green-500">✓</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>WPS Enabled (Potentially Vulnerable)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : "—"}
                            </td>
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
              </div>
            )}
            
            {selectedNetwork && (
              <Card className="bg-cyber-darker border-cyber-dark">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">{selectedNetwork.ssid}</CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">{selectedNetwork.bssid}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{selectedNetwork.security}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        <Badge variant="outline" className="mr-1">
                          Ch {selectedNetwork.channel}
                        </Badge>
                        <Badge variant="outline" className="bg-cyber-dark/30">
                          {selectedNetwork.frequency.includes('2.4') ? '2.4 GHz' : '5 GHz'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Vendor:</span>
                      <span className="font-medium">{selectedNetwork.vendor}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Clients:</span>
                      <span className="font-medium">{selectedNetwork.clients}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Signal:</span>
                      <span className="font-medium">{selectedNetwork.signal} dBm ({getSignalStrengthText(selectedNetwork.signal)})</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">WPS:</span>
                      <span className="font-medium">{selectedNetwork.wps ? "Enabled" : "Disabled"}</span>
                    </div>
                  </div>
                  
                  {showAdvancedOptions && (
                    <div className="mb-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Label htmlFor="useDeauth" className="text-sm flex-1">
                          Use Deauthentication
                          <p className="text-xs text-gray-400 mt-0.5">
                            Speed up handshake capture by disconnecting clients
                          </p>
                        </Label>
                        <Switch 
                          id="useDeauth" 
                          checked={useDeauth} 
                          onCheckedChange={setUseDeauth}
                        />
                      </div>
                      
                      {useDeauth && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deauthCount" className="text-sm">
                              Deauth Packets
                            </Label>
                            <Select 
                              value={deauthCount.toString()} 
                              onValueChange={(value) => setDeauthCount(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Deauth count" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 (Minimal)</SelectItem>
                                <SelectItem value="5">5 (Default)</SelectItem>
                                <SelectItem value="10">10 (Aggressive)</SelectItem>
                                <SelectItem value="20">20 (Very Aggressive)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="captureTimeout" className="text-sm">
                              Capture Timeout
                            </Label>
                            <Select 
                              value={captureTimeout.toString()} 
                              onValueChange={(value) => setCaptureTimeout(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Timeout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      
                      <Textarea 
                        placeholder="Custom handshake capture command..." 
                        value={handshakePrompt}
                        onChange={(e) => setHandshakePrompt(e.target.value)}
                        className="h-24 font-mono text-xs mt-4"
                      />
                    </div>
                  )}
                  
                  {useDeauth && (
                    <div className="mb-4 p-2 bg-amber-900/30 border border-amber-500/30 rounded flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-amber-200">
                        Deauthentication will disconnect all clients from this network temporarily. 
                        Only use for authorized penetration testing.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Button
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="bg-cyber-blue hover:bg-cyber-blue/80"
                    >
                      {isCapturing ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                          Capturing Handshake...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Capture WPA Handshake
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
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <div>Capturing handshake: {captureProgress}%</div>
                        <div>Time remaining: ~{Math.ceil((100 - captureProgress) / (useDeauth ? 15 : 10) * (useDeauth ? 0.4 : 0.8))}s</div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-cyber-blue" 
                          style={{ width: `${captureProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {useDeauth ? (
                          <>Sending deauthentication packets to trigger reconnections and capture EAPOL handshake frames...</>
                        ) : (
                          <>Waiting for clients to connect/reconnect to capture authentication handshake...</>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="handshake" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="dictionary" className="text-sm mb-2 block text-gray-300">
                Upload Dictionary File for Password Cracking
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
            
            {showAdvancedOptions && (
              <div className="bg-cyber-darker border border-cyber-dark rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Handshake Analysis Options</h3>
                <Textarea 
                  placeholder="Custom handshake analysis command..." 
                  value={handshakePrompt}
                  onChange={(e) => setHandshakePrompt(e.target.value)}
                  className="h-24 font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Natural language prompt for handshake analysis
                </p>
                
                <div className="mt-4 text-xs text-gray-300">
                  <p className="font-medium mb-1">Sample Commands:</p>
                  <ul className="bg-black/30 p-2 rounded font-mono space-y-1 border border-gray-700">
                    <li className="ml-4">• airmon-ng start wlan0</li>
                    <li className="ml-4">• airodump-ng wlan0mon</li>
                    <li className="ml-4">• airodump-ng -c [channel] --bssid [bssid] -w [file] wlan0mon</li>
                    <li className="ml-4">• aireplay-ng -0 5 -a [bssid] wlan0mon</li>
                    <li className="ml-4">• hashcat -m 22000 [file.cap] [wordlist] -r rules/best64.rule</li>
                  </ul>
                </div>
              </div>
            )}
            
            {lastCommand && (
              <div className="w-full font-mono text-xs bg-black/50 rounded-md p-3 border border-gray-700 overflow-x-auto">
                <div className="flex items-center mb-1">
                  <Terminal className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                  <span className="text-green-500">Command:</span>
                </div>
                <code className="text-gray-300">{lastCommand}</code>
              </div>
            )}
            
            {captures.length > 0 ? (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Captured Handshakes
                </Label>
                <div className="space-y-3">
                  {captures.map((capture) => (
                    <Card 
                      key={capture.id} 
                      className="bg-cyber-darker border-cyber-dark"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="font-medium text-base">{capture.ssid}</CardTitle>
                            <CardDescription className="text-xs font-mono mt-1">
                              {capture.bssid}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={`${
                              capture.status === 'cracked' 
                                ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                                : capture.status === 'analyzing'
                                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
                                  : 'bg-gray-900/30 text-gray-400 border-gray-500/50'
                            } px-2 py-1 text-xs font-medium`}
                          >
                            {capture.status === 'cracked' 
                              ? 'Cracked' 
                              : capture.status === 'analyzing'
                                ? 'Analyzing...'
                                : 'Captured'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Captured</div>
                            <div className="mt-0.5 text-xs">{capture.timestamp}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Method</div>
                            <div className="mt-0.5 text-xs">{capture.captureMethod}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">EAPOL Frames</div>
                            <div className="mt-0.5 text-xs">{capture.eapolCount}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">File Size</div>
                            <div className="mt-0.5 text-xs">{capture.fileSize}</div>
                          </div>
                        </div>
                        
                        <div className="font-mono text-xs bg-black/30 p-2 rounded border border-gray-700 mb-3">
                          <div className="text-gray-400">File Path:</div>
                          <div className="mt-0.5 text-gray-300">{capture.filePath}</div>
                        </div>
                        
                        {capture.status === 'cracked' && capture.password && (
                          <div className="mb-3 p-3 bg-green-900/20 border border-green-500/30 rounded">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 text-green-400 mr-2" />
                              <div className="text-sm font-medium text-green-400">Password Cracked!</div>
                            </div>
                            <div className="mt-2 font-mono text-green-400 bg-black/40 p-2 rounded border border-green-500/20">
                              {capture.password}
                            </div>
                            <div className="mt-2 text-xs text-gray-400 flex items-center">
                              <div className="flex-1">
                                Attack: Dictionary with rules
                              </div>
                              <div>
                                Time: {Math.floor(Math.random() * 60) + 5}s
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
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
                            Save Capture
                          </Button>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Terminal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0">
                              <div className="p-3 border-b border-border">
                                <h4 className="font-medium text-sm">Handshake Analysis Commands</h4>
                              </div>
                              <div className="p-3 space-y-2 font-mono text-xs">
                                <div>
                                  <p className="text-gray-400 mb-1"># Convert capture file to hashcat format</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hcxpcapngtool -o {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 {capture.filePath}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Crack with hashcat</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hashcat -m 22000 {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 wordlist.txt -r rules/best64.rule
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Check if capture has handshake</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    aircrack-ng {capture.filePath}
                                  </code>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardContent>
                    </Card>
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
