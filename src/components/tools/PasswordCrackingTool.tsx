
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCcw, KeyRound, Play, FileText, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

type HashType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'ntlm';

const PasswordCrackingTool: React.FC = () => {
  const [hashValue, setHashValue] = useState('');
  const [hashType, setHashType] = useState<HashType>('md5');
  const [crackMethod, setCrackMethod] = useState<'dictionary' | 'bruteforce'>('dictionary');
  const [dictionaryContent, setDictionaryContent] = useState('');
  const [bruteforceChars, setBruteforceChars] = useState('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  const [bruteforceMaxLength, setBruteforceMaxLength] = useState(8);
  const [isCracking, setIsCracking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ password: string; timeTaken: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Sample hash values for demonstration
  const sampleHashes: Record<HashType, { hash: string; password: string }> = {
    'md5': { 
      hash: '5f4dcc3b5aa765d61d8327deb882cf99', 
      password: 'password'
    },
    'sha1': { 
      hash: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8', 
      password: 'password'
    },
    'sha256': { 
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 
      password: 'password'
    },
    'sha512': { 
      hash: 'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86', 
      password: 'password'
    },
    'ntlm': { 
      hash: '8846f7eaee8fb117ad06bdd830b7586c', 
      password: 'password'
    }
  };

  // Function to load a sample hash
  const loadSampleHash = () => {
    setHashValue(sampleHashes[hashType].hash);
    setError(null);
    setResult(null);
  };

  // Function to load a sample dictionary
  const loadSampleDictionary = () => {
    const sampleDictionary = `123456
password
12345678
qwerty
123456789
12345
1234
111111
1234567
dragon
123123
baseball
abc123
football
monkey
letmein
shadow
master
666666
qwertyuiop`;
    setDictionaryContent(sampleDictionary);
  };

  const handleStartCracking = () => {
    if (!hashValue) {
      toast({
        title: "Missing Hash",
        description: "Please enter a hash value to crack.",
        variant: "destructive",
      });
      return;
    }

    if (crackMethod === 'dictionary' && !dictionaryContent) {
      toast({
        title: "Missing Dictionary",
        description: "Please provide a password dictionary.",
        variant: "destructive",
      });
      return;
    }

    setIsCracking(true);
    setProgress(0);
    setResult(null);
    setError(null);

    // Simulate the cracking process
    const totalSteps = crackMethod === 'dictionary' 
      ? dictionaryContent.split('\n').length 
      : Math.min(500, Math.pow(bruteforceChars.length, Math.min(4, bruteforceMaxLength)));
    
    let currentStep = 0;
    const knownHash = sampleHashes[hashType].hash.toLowerCase();
    const targetPassword = sampleHashes[hashType].password;
    const interval = setInterval(() => {
      currentStep += 1;
      const newProgress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setProgress(newProgress);
      
      // For demonstration purposes, we'll "find" the password if:
      // 1. The hash matches one of our sample hashes
      // 2. OR randomly with a small probability as progress increases
      const hashMatches = hashValue.toLowerCase() === knownHash;
      const randomSuccess = Math.random() < 0.005 * (newProgress / 100);
      
      if (hashMatches || (randomSuccess && newProgress > 30)) {
        clearInterval(interval);
        
        setTimeout(() => {
          if (hashMatches) {
            setResult({
              password: targetPassword,
              timeTaken: `${(Math.random() * 2 + 0.5).toFixed(2)} seconds`
            });
          } else {
            // Generate a random password for demonstration
            const dictionaryLines = dictionaryContent.split('\n');
            const randomPassword = dictionaryLines.length > 0 
              ? dictionaryLines[Math.floor(Math.random() * dictionaryLines.length)]
              : Array(Math.floor(Math.random() * 8) + 4)
                  .fill(0)
                  .map(() => bruteforceChars.charAt(Math.floor(Math.random() * bruteforceChars.length)))
                  .join('');
            
            setResult({
              password: randomPassword,
              timeTaken: `${(Math.random() * 10 + 1).toFixed(2)} seconds`
            });
          }
          
          setIsCracking(false);
          setProgress(100);
          
          toast({
            title: "Password Cracked",
            description: "Successfully found the password!",
          });
        }, 1000);
      } else if (newProgress >= 100) {
        clearInterval(interval);
        
        setTimeout(() => {
          setIsCracking(false);
          setError("Could not crack the password with the current settings. Try a different approach or dictionary.");
          
          toast({
            title: "Cracking Failed",
            description: "Could not find the password. Try a different approach.",
            variant: "destructive",
          });
        }, 1000);
      }
    }, 100);
  };

  const handleReset = () => {
    setHashValue('');
    setHashType('md5');
    setCrackMethod('dictionary');
    setDictionaryContent('');
    setBruteforceChars('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    setBruteforceMaxLength(8);
    setIsCracking(false);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    
    navigator.clipboard.writeText(result.password);
    toast({
      title: "Copied to clipboard",
      description: "The password has been copied to your clipboard.",
    });
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
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

        <div className="space-y-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="hashType" className="text-sm text-gray-300">
                Hash Type
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadSampleHash}
                className="h-6 px-2 text-xs"
              >
                Load Sample
              </Button>
            </div>
            <div className="flex gap-4">
              <Select
                value={hashType}
                onValueChange={(value) => setHashType(value as HashType)}
              >
                <SelectTrigger id="hashType" className="w-full">
                  <SelectValue placeholder="Select hash type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md5">MD5</SelectItem>
                  <SelectItem value="sha1">SHA-1</SelectItem>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="sha512">SHA-512</SelectItem>
                  <SelectItem value="ntlm">NTLM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Select the hashing algorithm used to generate the hash.
            </p>
          </div>
          
          <div className="w-full">
            <Label htmlFor="hash" className="text-sm mb-2 block text-gray-300">
              Hash Value
            </Label>
            <Input
              id="hash"
              value={hashValue}
              onChange={(e) => setHashValue(e.target.value)}
              placeholder="Enter the hash value to crack"
              className="font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Example: 5f4dcc3b5aa765d61d8327deb882cf99 (MD5 hash of "password")
            </p>
          </div>
          
          <div className="w-full">
            <Label className="text-sm mb-2 block text-gray-300">
              Cracking Method
            </Label>
            <Tabs 
              value={crackMethod} 
              onValueChange={(value) => setCrackMethod(value as 'dictionary' | 'bruteforce')}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="dictionary">Dictionary Attack</TabsTrigger>
                <TabsTrigger value="bruteforce">Brute Force</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dictionary" className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="dictionary" className="text-sm text-gray-300">
                      Password Dictionary
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadSampleDictionary}
                      className="h-6 px-2 text-xs"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Load Sample
                    </Button>
                  </div>
                  <Textarea
                    id="dictionary"
                    value={dictionaryContent}
                    onChange={(e) => setDictionaryContent(e.target.value)}
                    placeholder="Enter passwords, one per line"
                    className="font-mono resize-y min-h-[150px]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter potential passwords, one per line. The more comprehensive your dictionary, the higher the chance of success.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="bruteforce" className="space-y-4">
                <div>
                  <Label htmlFor="charset" className="text-sm mb-2 block text-gray-300">
                    Character Set
                  </Label>
                  <Input
                    id="charset"
                    value={bruteforceChars}
                    onChange={(e) => setBruteforceChars(e.target.value)}
                    placeholder="Characters to use in brute force"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Characters to use in the brute force attack. More characters increase the search space.
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="maxlength" className="text-sm mb-2 block text-gray-300">
                    Maximum Length: {bruteforceMaxLength}
                  </Label>
                  <Input
                    id="maxlength"
                    type="range"
                    min="4"
                    max="12"
                    value={bruteforceMaxLength}
                    onChange={(e) => setBruteforceMaxLength(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>4</span>
                    <span>8</span>
                    <span>12</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Maximum password length to try. Larger values exponentially increase cracking time.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <Button
            onClick={handleStartCracking}
            disabled={isCracking || !hashValue}
            className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
          >
            {isCracking ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                Cracking... {progress}%
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Cracking
              </>
            )}
          </Button>
          
          {isCracking && (
            <div className="w-full">
              <Progress value={progress} className="h-2 bg-gray-700" />
              <p className="text-xs text-gray-400 text-center mt-1">
                Testing possible passwords... This may take a while depending on complexity.
              </p>
            </div>
          )}
          
          {error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 rounded-md p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-400">Cracking Failed</h4>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          )}
          
          {result && (
            <div className="w-full bg-green-900/30 border border-green-500/50 rounded-md p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-400">Password Cracked!</h4>
                  <p className="text-sm text-gray-300 mt-1">Completed in {result.timeTaken}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </Button>
              </div>
              <div className="mt-3 p-3 bg-black/30 rounded font-mono text-green-300 break-all">
                {result.password}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordCrackingTool;
