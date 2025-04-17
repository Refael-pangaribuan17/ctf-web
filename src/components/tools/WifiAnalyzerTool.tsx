
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Shield, Users, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Mock data for WiFi networks since browsers can't directly scan WiFi
const mockWifiNetworks = [
  { 
    ssid: "Home_Network", 
    bssid: "00:1A:2B:3C:4D:5E", 
    security: "WPA2", 
    signalStrength: 87, 
    channel: 6,
    frequency: "2.4 GHz",
    clients: [
      { mac: "12:34:56:78:9A:BC", hostname: "iPhone", connectTime: "2 hours", signalQuality: 92, dataUsage: "1.2 GB" },
      { mac: "23:45:67:89:AB:CD", hostname: "MacBook", connectTime: "5 hours", signalQuality: 85, dataUsage: "3.7 GB" },
      { mac: "34:56:78:9A:BC:DE", hostname: "Android-TV", connectTime: "12 hours", signalQuality: 78, dataUsage: "8.5 GB" }
    ]
  },
  { 
    ssid: "Guest_Network", 
    bssid: "00:2B:3C:4D:5E:6F", 
    security: "WPA2", 
    signalStrength: 65, 
    channel: 11,
    frequency: "2.4 GHz",
    clients: [
      { mac: "45:67:89:AB:CD:EF", hostname: "Guest-Phone", connectTime: "30 minutes", signalQuality: 72, dataUsage: "0.3 GB" }
    ]
  },
  { 
    ssid: "Office_5G", 
    bssid: "00:3C:4D:5E:6F:7G", 
    security: "WPA3", 
    signalStrength: 92, 
    channel: 36,
    frequency: "5 GHz",
    clients: [
      { mac: "56:78:9A:BC:DE:F0", hostname: "Work-Laptop", connectTime: "8 hours", signalQuality: 95, dataUsage: "5.8 GB" },
      { mac: "67:89:AB:CD:EF:01", hostname: "Conference-Tablet", connectTime: "4 hours", signalQuality: 90, dataUsage: "2.1 GB" }
    ]
  }
];

const WifiAnalyzerTool = () => {
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<typeof mockWifiNetworks>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<(typeof mockWifiNetworks)[0] | null>(null);
  const [handshakeCaptured, setHandshakeCaptured] = useState(false);
  const [dictionaryFile, setDictionaryFile] = useState<File | null>(null);

  // Simulate WiFi scanning
  const handleScan = () => {
    setScanning(true);
    setNetworks([]);
    
    // Simulate scan delay
    setTimeout(() => {
      setNetworks(mockWifiNetworks);
      setScanning(false);
    }, 2500);
  };

  const handleNetworkSelect = (network: typeof mockWifiNetworks[0]) => {
    setSelectedNetwork(network);
  };

  const handleCaptureHandshake = () => {
    // In a real application, this would attempt to capture a handshake
    // Here we just simulate it with a timeout
    setHandshakeCaptured(true);
  };

  useEffect(() => {
    // Auto-scan on component mount
    handleScan();
  }, []);

  const getSignalIcon = (strength: number) => {
    if (strength > 80) return <Wifi className="h-5 w-5 text-green-500" />;
    if (strength > 50) return <Wifi className="h-5 w-5 text-yellow-500" />;
    return <Wifi className="h-5 w-5 text-red-500" />;
  };

  const getSecurityIcon = (security: string) => {
    return <Shield className="h-5 w-5 text-blue-500" title={security} />;
  };

  return (
    <Card className="border border-blue-800/30 bg-black/50 backdrop-blur-sm shadow-glow">
      <CardHeader>
        <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
          <Wifi className="h-6 w-6" />
          WiFi Analyzer
        </CardTitle>
        <CardDescription>
          Scan, analyze, and monitor WiFi networks and connected devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="networks" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="networks">Network Scanner</TabsTrigger>
            <TabsTrigger value="clients">Client Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="networks" className="space-y-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <Button 
                onClick={handleScan} 
                className="bg-cyber-blue hover:bg-cyber-blue/80"
                disabled={scanning}
              >
                {scanning ? "Scanning..." : "Scan Networks"}
              </Button>
            </div>

            {scanning ? (
              <div className="text-center py-8">
                <Wifi className="h-8 w-8 mx-auto mb-4 animate-pulse text-cyan-400" />
                <p>Scanning for WiFi networks...</p>
                <Progress value={45} className="w-full mt-4" />
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
                        {getSecurityIcon(network.security)}
                        <Badge variant="outline">{network.security}</Badge>
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
        <p className="text-xs text-gray-500 mb-2">
          Note: This is a simulation for educational purposes. In a real-world CTF, WiFi analysis requires specialized hardware.
        </p>
      </CardFooter>
    </Card>
  );
};

export default WifiAnalyzerTool;
