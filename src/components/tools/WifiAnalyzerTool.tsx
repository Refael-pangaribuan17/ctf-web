
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Upload, Wifi, Download, Play, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';

const WifiAnalyzerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [bssid, setBssid] = useState('');
  const [essid, setEssid] = useState('');
  const [channel, setChannel] = useState('');
  const [captures, setCaptures] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.cap') && !selectedFile.name.endsWith('.pcap')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a .cap or .pcap file",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    setResult(null);
    
    // Simulate auto-detection of WiFi network details
    setTimeout(() => {
      setBssid('00:11:22:33:44:55');
      setEssid('CaptureTheFlag');
      setChannel('6');
      setCaptures(142);
      
      toast({
        title: "File loaded",
        description: `Successfully loaded ${selectedFile.name} (${Math.round(selectedFile.size/1024)} KB)`,
      });
    }, 500);
  };

  const handleAnalyze = () => {
    if (!file) {
      toast({
        title: "No file",
        description: "Please upload a capture file first",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate analysis process
    setTimeout(() => {
      const analysisResults = [
        "=== WiFi Capture Analysis ===",
        `File: ${file.name}`,
        `Size: ${Math.round(file.size/1024)} KB`,
        `BSSID: ${bssid}`,
        `ESSID: ${essid}`,
        `Channel: ${channel}`,
        `Packets captured: ${captures}`,
        "------------------------",
        "WPA Handshake: ✓ FOUND",
        "WPA Key Version: v1",
        "Key Exchange Messages: 4/4 (Complete)",
        "Client MAC: A4:B5:C6:D7:E8:F9",
        "------------------------",
        "Handshake Quality: Strong",
        "Estimated cracking difficulty: Medium",
        "Recommended approach: Dictionary attack with rules"
      ];
      
      setResult(analysisResults.join("\n"));
      setIsProcessing(false);
      
      toast({
        title: "Analysis complete",
        description: "Handshake captured in file is valid and can be used for password recovery",
      });
    }, 2000);
  };

  const handleCrack = () => {
    if (!file) {
      toast({
        title: "No file",
        description: "Please upload a capture file first",
        variant: "destructive"
      });
      return;
    }
    
    if (!result || !result.includes("FOUND")) {
      toast({
        title: "No handshake",
        description: "No valid handshake found in the capture file",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate cracking process
    const totalTime = 5000;
    const interval = 200;
    let progress = 0;
    
    const crackingInterval = setInterval(() => {
      progress += interval;
      
      if (progress >= totalTime) {
        clearInterval(crackingInterval);
        setIsProcessing(false);
        
        const crackResults = [
          "=== Password Recovery Results ===",
          `BSSID: ${bssid}`,
          `ESSID: ${essid}`,
          "------------------------",
          "✓ PASSWORD FOUND: hacktheplanet",
          "------------------------",
          "Method: Dictionary attack",
          "Attempts: 24,563",
          "Time: 4.8 seconds",
          "Speed: ~5,100 passwords/sec"
        ];
        
        setResult(crackResults.join("\n"));
        
        toast({
          title: "Password found!",
          description: "The WiFi password has been successfully recovered",
        });
      }
    }, interval);
  };

  const handleReset = () => {
    setFile(null);
    setBssid('');
    setEssid('');
    setChannel('');
    setCaptures(0);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveResults = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wifi_analysis_results.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

        <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-200/80">
            This tool is for educational purposes only. Only analyze WiFi networks you own or have permission to test.
          </p>
        </div>

        <Tabs defaultValue="analyze" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="analyze">Analyze Capture</TabsTrigger>
            <TabsTrigger value="crack">Password Recovery</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capture-file" className="text-sm mb-2 block text-gray-300">
                  Upload Capture File (.cap/.pcap)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="capture-file"
                    type="file"
                    accept=".cap,.pcap"
                    onChange={handleFileChange}
                    className="font-mono"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Browse
                  </Button>
                </div>
                {file && (
                  <p className="text-xs text-green-400 mt-1">
                    {file.name} ({Math.round(file.size/1024)} KB) loaded
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="bssid" className="text-sm mb-2 block text-gray-300">
                    BSSID (MAC)
                  </Label>
                  <Input
                    id="bssid"
                    value={bssid}
                    onChange={(e) => setBssid(e.target.value)}
                    placeholder="00:11:22:33:44:55"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="essid" className="text-sm mb-2 block text-gray-300">
                    ESSID (Name)
                  </Label>
                  <Input
                    id="essid"
                    value={essid}
                    onChange={(e) => setEssid(e.target.value)}
                    placeholder="Network name"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="channel" className="text-sm mb-2 block text-gray-300">
                    Channel
                  </Label>
                  <Input
                    id="channel"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="1-14"
                    className="font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="captures" className="text-sm mb-2 block text-gray-300">
                    Packets
                  </Label>
                  <Input
                    id="captures"
                    value={captures || ''}
                    onChange={(e) => setCaptures(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleAnalyze}
              disabled={!file || isProcessing}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Analyzing..." : "Analyze Capture"}
            </Button>
            
            {result && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Analysis Results
                  </Label>
                  <Button
                    onClick={handleSaveResults}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                </div>
                <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-line">
                  {result}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="crack" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="dictionary" className="text-sm mb-2 block text-gray-300">
                Dictionary File (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="dictionary"
                  type="file"
                  accept=".txt,.dict"
                  className="font-mono"
                />
                <Button
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                For dictionary attacks, upload a wordlist. Leave empty to use default wordlist.
              </p>
            </div>
            
            <div className="w-full">
              <Label htmlFor="options" className="text-sm mb-2 block text-gray-300">
                Additional Options
              </Label>
              <Textarea
                id="options"
                placeholder="-r rules/best64.rule
--force
--workload=4"
                className="font-mono resize-y min-h-[100px]"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional: Enter advanced recovery options, one per line
              </p>
            </div>
            
            <Button
              onClick={handleCrack}
              disabled={!file || isProcessing || !result || !result.includes("FOUND")}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? "Recovering..." : "Start Password Recovery"}
            </Button>
            
            {result && result.includes("PASSWORD FOUND") && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Recovery Results
                  </Label>
                  <Button
                    onClick={handleSaveResults}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                </div>
                <div className="font-mono text-sm bg-cyber-darker border border-green-500/30 p-4 rounded-md whitespace-pre-line">
                  {result}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WifiAnalyzerTool;
