import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Copy, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

/**
 * Simple MD5 implementation for browser
 * Source: https://stackoverflow.com/questions/14733374/
 */
const md5 = (input: string) => {
  const hc = "0123456789abcdef";
  function rh(n: number) { var j, s = ""; for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0F) + hc.charAt((n >> (j * 8)) & 0x0F); return s; }
  function ad(x: number, y: number) { var l = (x & 0xFFFF) + (y & 0xFFFF); var m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
  function rl(n: number, c: number) { return (n << c) | (n >>> (32 - c)); }
  function cm(q: number, a: number, b: number, x: number, s: number, t: number) { return ad(rl(ad(ad(a, q), ad(x, t)), s), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cm(c ^ (b | (~d)), a, b, x, s, t); }
  function sb(x: string) {
    var i; var nblk = ((x.length + 8) >> 6) + 1; var blks = new Array(nblk * 16); for (i = 0; i < nblk * 16; i++) blks[i] = 0;
    for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
    blks[i >> 2] |= 0x80 << ((i % 4) * 8); blks[nblk * 16 - 2] = x.length * 8; return blks;
  }
  
  var i, x = sb(input), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, olda, oldb, oldc, oldd;
  for (i = 0; i < x.length; i += 16) {
    olda = a; oldb = b; oldc = c; oldd = d;
    a = ff(a, b, c, d, x[i + 0], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586); c = ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330); a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983); a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417); c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101); c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329); a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i + 0], 20, -373897302); a = gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = gg(d, a, b, c, x[i + 10], 9, 38016083); c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690); c = gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501); a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734); a = hh(a, b, c, d, x[i + 5], 4, -378558);
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463); c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353); c = hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640); a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189); a = hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = hh(d, a, b, c, x[i + 12], 11, -421815835); c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i + 0], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415); c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[i + 5], 21, -57434055); a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799); a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[i + 15], 10, -30611744); c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379); c = ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = ii(b, c, d, a, x[i + 9], 21, -343485551); a = ad(a, olda); b = ad(b, oldb); c = ad(c, oldc); d = ad(d, oldd);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
};

/**
 * Simple SHA-1 implementation 
 * Source: adapted from https://stackoverflow.com/questions/18338890/
 */
const sha1 = (msg: string) => {
  function rotate_left(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  function cvt_hex(val: number) {
    let str = '';
    for (let i = 7; i >= 0; i--) {
      let v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  }

  let blockstart;
  let i, j;
  let W = new Array(80);
  let H0 = 0x67452301;
  let H1 = 0xEFCDAB89;
  let H2 = 0x98BADCFE;
  let H3 = 0x10325476;
  let H4 = 0xC3D2E1F0;
  let A, B, C, D, E;
  let temp;
  
  let msg_len = msg.length;
  let word_array = [];
  
  for (i = 0; i < msg_len - 3; i += 4) {
    j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
    word_array.push(j);
  }
  
  switch (msg_len % 4) {
    case 0: i = 0x080000000; break;
    case 1: i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000; break;
    case 2: i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000; break;
    case 3: i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80; break;
  }
  
  word_array.push(i);
  
  while ((word_array.length % 16) !== 14) {
    word_array.push(0);
  }
  
  word_array.push(msg_len >>> 29);
  word_array.push((msg_len << 3) & 0x0ffffffff);
  
  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (i = 0; i < 16; i++) {
      W[i] = word_array[blockstart + i];
    }
    for (i = 16; i < 80; i++) {
      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    }
    
    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;
    
    for (i = 0; i < 20; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | ((~B) & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    
    for (i = 20; i < 40; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    
    for (i = 40; i < 60; i++) {
      temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    
    for (i = 60; i < 80; i++) {
      temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }
    
    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }
  
  return (cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4)).toLowerCase();
};

const HashGeneratorTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('md5');
  const [loadingState, setLoadingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    if (input) {
      handleGenerateHash();
    } else {
      setOutput('');
    }
  }, [input, algorithm]);

  const handleGenerateHash = async () => {
    if (!input) return;
    
    setLoadingState('processing');

    // Small processing delay for visual effect
    setTimeout(async () => {
      try {
        let result = '';
        
        switch (algorithm) {
          case 'md5':
            // Use our MD5 implementation
            result = md5(input);
            break;
          case 'sha1':
            // Use our SHA-1 implementation
            result = sha1(input);
            break;
          case 'sha256':
            // Use Web Crypto API for SHA-256
            const encodedData256 = new TextEncoder().encode(input);
            const hashBuffer256 = await crypto.subtle.digest('SHA-256', encodedData256);
            const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
            result = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');
            break;
          case 'sha512':
            // Use Web Crypto API for SHA-512
            const encodedData512 = new TextEncoder().encode(input);
            const hashBuffer512 = await crypto.subtle.digest('SHA-512', encodedData512);
            const hashArray512 = Array.from(new Uint8Array(hashBuffer512));
            result = hashArray512.map(b => b.toString(16).padStart(2, '0')).join('');
            break;
        }
        
        setOutput(result);
        setLoadingState('complete');
        
        // Reset complete state after a moment
        setTimeout(() => {
          setLoadingState('idle');
        }, 500);
      } catch (error) {
        toast({
          title: "Processing Error",
          description: "Failed to generate hash.",
          variant: "destructive",
        });
        setOutput('');
        setLoadingState('idle');
      }
    }, 300);
  };

  const handleCopy = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "The hash has been copied to your clipboard.",
    });
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setAlgorithm('md5');
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Shield className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Hash Generator</h2>
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
          {/* Algorithm selection */}
          <div className="w-full">
            <Label htmlFor="algorithm" className="text-sm mb-2 block text-gray-300">
              Hash Algorithm
            </Label>
            <ToggleGroup
              type="single"
              value={algorithm}
              onValueChange={(value) => value && setAlgorithm(value as HashAlgorithm)}
              className="w-full justify-start border border-border rounded-md overflow-hidden p-1"
            >
              <ToggleGroupItem value="md5" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                MD5
              </ToggleGroupItem>
              <ToggleGroupItem value="sha1" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-1
              </ToggleGroupItem>
              <ToggleGroupItem value="sha256" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-256
              </ToggleGroupItem>
              <ToggleGroupItem value="sha512" className="flex-1 data-[state=on]:bg-cyber-blue/10">
                SHA-512
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Input field */}
          <div className="w-full">
            <Label htmlFor="input" className="text-sm mb-2 block text-gray-300">
              Text to Hash
            </Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to generate hash..."
              className="font-mono resize-y min-h-[100px]"
            />
          </div>

          {/* Output display */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="output" className="text-sm text-gray-300">
                Hash Result
              </Label>
              {output && (
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
              className={`relative font-mono min-h-[80px] p-4 rounded-md bg-cyber-darker border border-cyber-dark transition-all duration-300 overflow-auto ${
                loadingState === 'processing' ? 'bg-cyber-dark/50' : ''
              }`}
            >
              {loadingState === 'processing' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse text-cyber-blue">Generating hash...</div>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 break-all ${output ? 'opacity-100' : 'opacity-50'}`}>
                  {output || "Hash will appear here..."}
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
                <div 
                  className={`h-full bg-cyber-blue transition-transform duration-500 ${
                    loadingState === 'processing' ? 'translate-x-0' : '-translate-x-full'
                  }`}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Add hash information */}
          <div className="mt-2 p-3 border border-gray-700 rounded-md bg-cyber-darker/50">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Algorithm Information</h4>
            <div className="space-y-1 text-xs text-gray-400">
              {algorithm === 'md5' && (
                <>
                  <p><strong>MD5:</strong> 128-bit hash function, commonly used but now considered cryptographically broken.</p>
                  <p>Example MD5 hash of "hello": 5d41402abc4b2a76b9719d911017c592</p>
                </>
              )}
              {algorithm === 'sha1' && (
                <>
                  <p><strong>SHA-1:</strong> 160-bit hash function, newer than MD5 but also considered vulnerable.</p>
                  <p>Example SHA-1 hash of "hello": aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d</p>
                </>
              )}
              {algorithm === 'sha256' && (
                <>
                  <p><strong>SHA-256:</strong> 256-bit hash function from the SHA-2 family, widely used for security applications.</p>
                  <p>Example SHA-256 hash of "hello": 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824</p>
                </>
              )}
              {algorithm === 'sha512' && (
                <>
                  <p><strong>SHA-512:</strong> 512-bit hash function from the SHA-2 family, provides the strongest security of these options.</p>
                  <p>Example SHA-512 hash of "hello" (truncated): 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72...</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashGeneratorTool;
