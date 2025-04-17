
import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Shield, Users, Info, Activity, AlertTriangle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

// Simulated WiFi data - in a real app, this would come from native APIs through Capacitor/Cordova
// Web browsers cannot directly access WiFi information due to security restrictions
const generateMockNetworks = () => {
  // This is only a simulation - in a real world app, we'd use device APIs
  const networks = [
    { 
      ssid: "Home_Network", 
      bssid: "00:1A:2B:3C:4D:5E", 
      security: "WPA2", 
      signalStrength: Math.floor(Math.random() * 20) + 75, // 75-95%
      channel: 6,
      frequency: "2.4 GHz",
      clients: [
        { mac: "12:34:56:78:9A:BC", hostname: "iPhone", connectTime: "2 hours", signalQuality: Math.floor(Math.random() * 10) + 85, dataUsage: "1.2 GB" },
        { mac: "23:45:67:89:AB:CD", hostname: "MacBook", connectTime: "5 hours", signalQuality: Math.floor(Math.random() * 15) + 80, dataUsage: "3.7 GB" },
      ]
    },
    { 
      ssid: "Guest_Network", 
      bssid: "00:2B:3C:4D:5E:6F", 
      security: "WPA2", 
      signalStrength: Math.floor(Math.random() * 30) + 50, // 50-80%
      channel: 11,
      frequency: "2.4 GHz",
      clients: [
        { mac: "45:67:89:AB:CD:EF", hostname: "Guest-Phone", connectTime: "30 minutes", signalQuality: Math.floor(Math.random() * 20) + 60, dataUsage: "0.3 GB" }
      ]
    }
  ];
  
  // Randomly determine if we should add a 5GHz network for variety
  if (Math.random() > 0.3) {
    networks.push({ 
      ssid: "Office_5G", 
      bssid: "00:3C:4D:5E:6F:7G", 
      security: "WPA3", 
      signalStrength: Math.floor(Math.random() * 15) + 85, // 85-100%
      channel: 36,
      frequency: "5 GHz",
      clients: [
        { mac: "56:78:9A:BC:DE:F0", hostname: "Work-Laptop", connectTime: "8 hours", signalQuality: Math.floor(Math.random() * 10) + 90, dataUsage: "5.8 GB" },
      ]
    });
  }
  
  return networks;
};

const WifiAnalyzerTool = () => {
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [networks, setNetworks] = useState<ReturnType<typeof generateMockNetworks>>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<ReturnType<typeof generateMockNetworks>[0] | null>(null);
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  // Function to perform a simulated scan
  const handleScan = useCallback(() => {
    // Clear any existing scan interval
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
    
    setScanning(true);
    setScanProgress(0);
    setNetworks([]);
    
    // Simulate progressive scan with progress updates
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Simulate scan completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setScanProgress(100);
      
      // Generate slightly randomized "real-time" data
      const newNetworks = generateMockNetworks();
      setNetworks(newNetworks);
      setScanning(false);
      setLastScanTime(new Date());
      
      toast({
        title: "Scan Complete",
        description: `Found ${newNetworks.length} networks`,
      });
    }, 2500);
  }, [scanInterval]);

  // Auto-rescan periodically to simulate real-time updates
  const startAutoScan = useCallback(() => {
    if (scanInterval) {
      clearInterval(scanInterval);
    }
    
    const interval = setInterval(() => {
      if (!scanning) {
        handleScan();
      }
    }, 30000); // Auto-scan every 30 seconds
    
    setScanInterval(interval);
    
    // Clean up on component unmount
    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [handleScan, scanInterval, scanning]);

  const handleNetworkSelect = (network: ReturnType<typeof generateMockNetworks>[0]) => {
    setSelectedNetwork(network);
  };

  useEffect(() => {
    // Auto-scan on component mount
    handleScan();
    
    // Start auto-scan feature
    startAutoScan();
    
    // Cleanup when component unmounts
    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [handleScan, startAutoScan, scanInterval]);

  const getSignalIcon = (strength: number) => {
    if (strength > 80) return <Wifi className="h-5 w-5 text-green-500" />;
    if (strength > 50) return <Wifi className="h-5 w-5 text-yellow-500" />;
    return <Wifi className="h-5 w-5 text-red-500" />;
  };

  const getSecurityBadge = (security: string) => {
    const color = security === "WPA3" ? "bg-green-600" : 
                  security === "WPA2" ? "bg-blue-600" : "bg-red-600";
    return <Badge className={color}>{security}</Badge>;
  };

  return (
    <Card className="border border-blue-800/30 bg-black/50 backdrop-blur-sm shadow-glow">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
          <Wifi className="h-6 w-6" />
          WiFi Analyzer
        </CardTitle>
        <CardDescription>
          Scan and analyze WiFi networks and connected devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 border border-orange-500/30 bg-orange-950/20 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-orange-200">
              <strong>Browser Limitation:</strong> Web browsers cannot directly access WiFi information due to security restrictions. 
              This is a simulation showing how the tool would work on a native app. For real WiFi scanning, this application would need 
              to be compiled as a native app using Capacitor or a similar framework.
            </p>
          </div>
        </div>

        <Tabs defaultValue="networks" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="networks">Network Scanner</TabsTrigger>
            <TabsTrigger value="clients">Client Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="networks" className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleScan} 
                  className="bg-cyber-blue hover:bg-cyber-blue/80 flex items-center gap-2"
                  disabled={scanning}
                >
                  <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
                  {scanning ? "Scanning..." : "Scan Networks"}
                </Button>
                
                {lastScanTime && (
                  <span className="text-xs text-gray-400">
                    Last scan: {lastScanTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              {networks.length > 0 && (
                <Badge variant="outline" className="bg-gray-800/50">
                  {networks.length} networks found
                </Badge>
              )}
            </div>

            {scanning ? (
              <div className="text-center py-8">
                <Wifi className="h-8 w-8 mx-auto mb-4 animate-pulse text-cyan-400" />
                <p>Scanning for WiFi networks...</p>
                <Progress value={scanProgress} className="w-full mt-4" />
              </div>
            ) : networks.length > 0 ? (
              <div className="grid gap-4">
                {networks.map((network, index) => (
                  <div 
                    key={index}
                    className={`p-4 border rounded-md transition-all cursor-pointer ${
                      selectedNetwork?.ssid === network.ssid 
                        ? "border-cyan-500 bg-cyan-950/20" 
                        : "border-gray-800 hover:border-gray-700 bg-gray-900/30"
                    }`}
                    onClick={() => handleNetworkSelect(network)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {getSignalIcon(network.signalStrength)}
                        <div>
                          <h3 className="font-medium text-white">{network.ssid}</h3>
                          <p className="text-xs text-gray-400">{network.bssid} • Ch {network.channel} • {network.frequency}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" aria-label={network.security} />
                        {getSecurityBadge(network.security)}
                        <Badge className="bg-blue-600">{network.signalStrength}%</Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{network.clients.length} connected {network.clients.length === 1 ? "client" : "clients"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <WifiOff className="h-12 w-12 mx-auto mb-4" />
                <p>No networks found. Click "Scan Networks" to start.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="clients">
            {selectedNetwork ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-md">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Wifi className="mr-2 h-5 w-5 text-cyan-400" />
                    {selectedNetwork.ssid}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div>BSSID: {selectedNetwork.bssid}</div>
                    <div>Channel: {selectedNetwork.channel}</div>
                    <div>Security: {selectedNetwork.security}</div>
                    <div>Signal: {selectedNetwork.signalStrength}%</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6 mb-2">Connected Clients ({selectedNetwork.clients.length})</h3>
                {selectedNetwork.clients.length > 0 ? (
                  <div className="space-y-3">
                    {selectedNetwork.clients.map((client, idx) => (
                      <div key={idx} className="p-3 border border-gray-800 rounded-md bg-gray-900/30">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{client.hostname}</h4>
                          <Badge variant="outline">{client.signalQuality}% Signal</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-400">
                          <div>MAC: {client.mac}</div>
                          <div>Connected: {client.connectTime}</div>
                          <div className="col-span-2">Data Usage: {client.dataUsage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-3" />
                    <p>No clients connected to this network</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-4" />
                <p>Select a network from the Network Scanner tab to view connected clients</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t border-gray-800 pt-4">
        <div className="flex items-start gap-2">
          <Activity className="h-4 w-4 text-cyan-400 mt-0.5" />
          <p className="text-xs text-gray-500">
            For real-time WiFi analysis in a production app, this tool would use native device APIs through frameworks like Capacitor.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WifiAnalyzerTool;
