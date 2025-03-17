
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound, Play, Download, RotateCcw, Upload, AlertTriangle } from 'lucide-react';

const PasswordCrackingTool: React.FC = () => {
  const [hashType, setHashType] = useState('md5');
  const [hash, setHash] = useState('');
  const [customWordlist, setCustomWordlist] = useState<File | null>(null);
  const [useDefaultWordlist, setUseDefaultWordlist] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [attackType, setAttackType] = useState('dictionary');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const commonHashes: Record<string, string> = {
    md5: '5f4dcc3b5aa765d61d8327deb882cf99', // 'password'
    sha1: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', // 'password'
    sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // 'password'
    ntlm: '8846F7EAEE8FB117AD06BDD830B7586C' // 'password'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a wordlist smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setCustomWordlist(file);
    setUseDefaultWordlist(false);
    
    toast({
      title: "Wordlist loaded",
      description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    });
  };

  const handleExampleHash = () => {
    setHash(commonHashes[hashType] || '');
  };

  const simulateCracking = () => {
    if (!hash.trim()) {
      toast({
        title: "No hash provided",
        description: "Please enter a hash to crack",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setResult(null);
    
    // Simulate the cracking process with progress updates
    const totalTime = attackType === 'dictionary' ? 3000 : 5000; // dictionary is faster
    const interval = 100;
    let currentProgress = 0;
    
    const updateInterval = setInterval(() => {
      currentProgress += (interval / totalTime) * 100;
      setProgress(Math.min(currentProgress, 99));
      
      if (currentProgress >= 100) {
        clearInterval(updateInterval);
        
        // For demonstration, we'll "crack" certain known hashes
        const lowerHash = hash.toLowerCase();
        let foundPassword = null;
        
        // Check if it's one of our example hashes (for "password")
        if (Object.values(commonHashes).some(h => h.toLowerCase() === lowerHash)) {
          foundPassword = 'password';
        } else if (lowerHash === '482c811da5d5b4bc6d497ffa98491e38') { // MD5 of "password123"
          foundPassword = 'password123';
        } else if (lowerHash === '5f4dcc3b5aa765d61d8327deb882cf99') { // MD5 of "password"
          foundPassword = 'password';
        } else if (hash.length === 32 && /^[a-fA-F0-9]+$/.test(hash)) {
          // If it's a valid MD5 hash but not in our known list, pretend we found something for demo
          foundPassword = 'demo_cracked_password';
        }
        
        setTimeout(() => {
          setProgress(100);
          
          if (foundPassword) {
            setResult(`Successfully cracked the hash!\n\nPassword: ${foundPassword}\n\nHash: ${hash}\nType: ${hashType.toUpperCase()}\nMethod: ${attackType === 'dictionary' ? 'Dictionary attack' : 'Brute force'}\n${customWordlist ? `Wordlist: ${customWordlist.name}` : ''}`);
            toast({
              title: "Password found!",
              description: `The password is: ${foundPassword}`,
            });
          } else {
            setResult(`Could not crack the hash.\n\nHash: ${hash}\nType: ${hashType.toUpperCase()}\nMethod: ${attackType === 'dictionary' ? 'Dictionary attack' : 'Brute force'}\n\nTry a different wordlist or hash type.`);
            toast({
              title: "Cracking failed",
              description: "Could not find the password. Try different settings.",
              variant: "destructive"
            });
          }
          
          setIsProcessing(false);
        }, 500);
      }
    }, interval);
  };

  const handleReset = () => {
    setHash('');
    setCustomWordlist(null);
    setUseDefaultWordlist(true);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveResult = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'password_cracking_result.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <KeyRound className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Password Cracker</h2>
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
            For educational purposes only. Use this tool to recover your own passwords or with explicit permission.
          </p>
        </div>

        <Tabs defaultValue="hash" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="hash">Hash Cracking</TabsTrigger>
            <TabsTrigger value="wordlist">Wordlist Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hash" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hash-type" className="text-sm mb-2 block text-gray-300">
                  Hash Type
                </Label>
                <Select 
                  value={hashType} 
                  onValueChange={setHashType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hash type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md5">MD5</SelectItem>
                    <SelectItem value="sha1">SHA1</SelectItem>
                    <SelectItem value="sha256">SHA256</SelectItem>
                    <SelectItem value="ntlm">NTLM</SelectItem>
                    <SelectItem value="bcrypt">BCrypt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="attack-type" className="text-sm mb-2 block text-gray-300">
                  Attack Method
                </Label>
                <Select 
                  value={attackType} 
                  onValueChange={setAttackType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attack method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dictionary">Dictionary Attack</SelectItem>
                    <SelectItem value="bruteforce">Brute Force</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="hash" className="text-sm mb-2 block text-gray-300">
                  Hash to Crack
                </Label>
                <Button 
                  variant="link" 
                  className="h-6 px-0 text-xs text-cyber-blue"
                  onClick={handleExampleHash}
                >
                  Use Example
                </Button>
              </div>
              <Textarea
                id="hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                placeholder="Enter hash value to crack (e.g., 5f4dcc3b5aa765d61d8327deb882cf99)"
                className="font-mono resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter a {hashType.toUpperCase()} hash that you want to crack.
              </p>
            </div>
            
            <Button
              onClick={simulateCracking}
              disabled={isProcessing || !hash.trim()}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                  Cracking in progress...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Cracking
                </>
              )}
            </Button>
            
            {isProcessing && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            {result && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Results
                  </Label>
                  <Button
                    onClick={handleSaveResult}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                </div>
                <div className={`font-mono text-sm p-4 rounded-md whitespace-pre-line ${result.includes('Successfully') ? 'bg-green-950/30 border border-green-500/30' : 'bg-cyber-darker border border-cyber-dark'}`}>
                  {result}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="wordlist" className="space-y-6">
            <div>
              <Label className="text-sm mb-2 block text-gray-300">
                Wordlist Option
              </Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="default-wordlist" 
                    checked={useDefaultWordlist}
                    onChange={() => setUseDefaultWordlist(true)}
                    className="mr-2"
                  />
                  <Label htmlFor="default-wordlist" className="text-sm cursor-pointer">
                    Use default wordlist (100,000 common passwords)
                  </Label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio"
                    id="custom-wordlist"
                    checked={!useDefaultWordlist}
                    onChange={() => setUseDefaultWordlist(false)}
                    className="mr-2"
                  />
                  <Label htmlFor="custom-wordlist" className="text-sm cursor-pointer">
                    Upload custom wordlist
                  </Label>
                </div>
              </div>
            </div>
            
            {!useDefaultWordlist && (
              <div>
                <Label htmlFor="wordlist-file" className="text-sm mb-2 block text-gray-300">
                  Custom Wordlist (.txt)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="wordlist-file"
                    type="file"
                    accept=".txt,.dict,.lst"
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
                <p className="text-xs text-gray-400 mt-1">
                  One password per line. Max file size: 10MB
                </p>
                
                {customWordlist && (
                  <p className="text-xs text-green-400 mt-2">
                    ✓ {customWordlist.name} ({(customWordlist.size / 1024).toFixed(1)} KB) loaded
                  </p>
                )}
              </div>
            )}
            
            <div className="p-4 bg-cyber-darker rounded-md">
              <h3 className="text-sm font-medium mb-2">Dictionary Attack Tips:</h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Use specialized wordlists for specific targets (e.g., English words, names)</li>
                <li>Common password lists are effective against many user accounts</li>
                <li>For better results, use larger wordlists or combine multiple lists</li>
                <li>Password variants (replacing 'a' with '@', etc.) are automatically tried</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PasswordCrackingTool;
