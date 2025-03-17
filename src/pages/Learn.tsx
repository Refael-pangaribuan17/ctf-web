import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Key, Shield, Terminal, Network, Globe, Code, Database, Wifi, Cpu, FileCode, Bug, Brain, FileDigit, FileLock, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackgroundAnimation from '@/components/BackgroundAnimation';
import { cn } from '@/lib/utils';

type LearningSection = {
  id: string;
  title: string;
  description: string;
  icon: React.FC<any>;
  content: React.ReactNode;
};

const Learn = () => {
  const sections: LearningSection[] = [
    {
      id: "crypto",
      title: "Cryptography",
      description: "Learn about encryption, ciphers, and hashing",
      icon: Lock,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Cryptography</CardTitle>
              <CardDescription>Understanding the basics of encryption and decryption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cryptography is the practice of secure communication in the presence of third parties. In CTF competitions, 
                cryptography challenges often involve decoding messages, breaking encryption schemes, or finding vulnerabilities 
                in cryptographic implementations.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Cryptographic Methods in CTFs</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Caesar Cipher</h4>
                  <p className="text-sm text-gray-300">
                    One of the simplest encryption techniques, where each letter in the plaintext is shifted a certain number of 
                    places down the alphabet. For example, with a shift of 1, A would be replaced by B, B by C, and so on.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Substitution Cipher</h4>
                  <p className="text-sm text-gray-300">
                    Each letter is replaced by another letter or symbol. Unlike the Caesar cipher, the substitutions aren't 
                    limited to shifts and can follow any pattern.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Base64 Encoding</h4>
                  <p className="text-sm text-gray-300">
                    A binary-to-text encoding scheme that represents binary data in an ASCII string format by 
                    translating it into a radix-64 representation. It's commonly used for encoding binary data in 
                    email or HTTP communications.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Hashing</h4>
                  <p className="text-sm text-gray-300">
                    A one-way function that converts data of arbitrary size to a fixed-size string. Common hashing 
                    algorithms include MD5, SHA-1, and SHA-256. In CTFs, you might need to find a string that produces 
                    a specific hash value (hash cracking).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Cryptography Challenge Tips</CardTitle>
              <CardDescription>Practical advice for solving crypto challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li className="text-gray-300">
                  <span className="font-medium text-white">Look for patterns</span> in the ciphertext that might indicate 
                  which encryption method was used.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Analyze frequencies</span> of characters to break substitution ciphers.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Try common methods first</span> - many challenges use simple encoding 
                  techniques like Base64, ROT13, or Caesar ciphers.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Look for clues in the challenge description</span> that might hint 
                  at the encryption method or key.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Use automated tools</span> to test different decryption methods quickly.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "web",
      title: "Web Security",
      description: "Learn about web vulnerabilities and exploitation",
      icon: Globe,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Web Security</CardTitle>
              <CardDescription>Understanding common web vulnerabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Web security challenges in CTFs test your knowledge of vulnerabilities in web applications.
                These challenges often involve finding and exploiting weaknesses in websites, servers, or web applications
                to gain unauthorized access or retrieve hidden information.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Web Vulnerabilities in CTFs</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">SQL Injection</h4>
                  <p className="text-sm text-gray-300">
                    A code injection technique that exploits vulnerabilities in the database layer of an application.
                    Attackers can insert malicious SQL statements to bypass authentication, retrieve, modify, or delete data.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Cross-Site Scripting (XSS)</h4>
                  <p className="text-sm text-gray-300">
                    A vulnerability that allows attackers to inject client-side scripts into web pages viewed by other users.
                    This can be used to steal cookies, session tokens, or other sensitive information.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Cross-Site Request Forgery (CSRF)</h4>
                  <p className="text-sm text-gray-300">
                    Forces authenticated users to submit a request to a web application against which they are currently authenticated.
                    This can lead to unauthorized actions being performed on behalf of the user.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Server-Side Request Forgery (SSRF)</h4>
                  <p className="text-sm text-gray-300">
                    Allows attackers to induce the server-side application to make requests to an unintended location.
                    This can be used to access internal services behind firewalls or to retrieve sensitive information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Web Challenge Tips</CardTitle>
              <CardDescription>Practical advice for solving web challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li className="text-gray-300">
                  <span className="font-medium text-white">Inspect the source code</span> of web pages to find hidden comments or scripts.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Check HTTP headers</span> for clues or hidden information.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Explore robots.txt and sitemap.xml</span> to discover hidden directories.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Analyze cookies and session tokens</span> for vulnerabilities.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Use browser developer tools</span> to monitor network traffic and debug JavaScript.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "forensics",
      title: "Digital Forensics",
      description: "Learn about data recovery and analysis",
      icon: Database,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Digital Forensics</CardTitle>
              <CardDescription>Understanding the art of data extraction and analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Digital forensics in CTF challenges involves extracting hidden information from various file formats,
                analyzing data remnants, and recovering deleted files. These challenges test your ability to uncover
                concealed data using forensic techniques.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Forensics Techniques in CTFs</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">File Format Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Examining file signatures, headers, and structures to identify hidden data or corrupted files.
                    Many challenges involve files that appear to be one format but actually contain hidden information in another format.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Steganography</h4>
                  <p className="text-sm text-gray-300">
                    The practice of concealing information within other non-secret data or a physical object.
                    In CTFs, this often involves extracting hidden messages from images, audio files, or videos.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Memory Forensics</h4>
                  <p className="text-sm text-gray-300">
                    Analyzing computer memory dumps to extract information about running processes,
                    network connections, or sensitive data that was in memory at the time of capture.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Metadata Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Examining data that describes other data, such as file creation dates, author information,
                    or camera settings in images. Metadata can often contain clues or even hidden messages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Forensics Challenge Tips</CardTitle>
              <CardDescription>Practical advice for solving forensics challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li className="text-gray-300">
                  <span className="font-medium text-white">Always check file signatures</span> to verify that the file is what it claims to be.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Use hex editors</span> to examine file contents at the byte level.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Extract metadata</span> from files using specialized tools.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Look for anomalies</span> in file sizes, structures, or contents.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Consider multiple layers of hiding</span> - information might be hidden inside already hidden data.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "network",
      title: "Network Analysis",
      description: "Learn about packet analysis and network security",
      icon: Wifi,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Network Analysis</CardTitle>
              <CardDescription>Understanding network traffic and protocols</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Network analysis challenges in CTFs often involve examining packet captures (PCAP files) to extract
                information about network communications, identify suspicious traffic, or recover data transmitted
                over a network.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Network Analysis Techniques in CTFs</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Packet Capture Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Examining captured network traffic to identify patterns, extract transmitted data,
                    or detect abnormal communications. Tools like Wireshark are commonly used for this purpose.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Protocol Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Understanding and analyzing specific network protocols like HTTP, FTP, DNS, or custom protocols
                    to extract information or identify vulnerabilities in their implementation.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Traffic Reconstruction</h4>
                  <p className="text-sm text-gray-300">
                    Reassembling data streams from packet captures to recover transmitted files, conversations,
                    or other information that was sent over the network.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Network Mapping</h4>
                  <p className="text-sm text-gray-300">
                    Identifying network topology, services, and potential entry points by analyzing network traffic
                    or using tools like Nmap to scan for open ports and running services.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Network Challenge Tips</CardTitle>
              <CardDescription>Practical advice for solving network challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li className="text-gray-300">
                  <span className="font-medium text-white">Apply filters in Wireshark</span> to focus on relevant traffic.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Follow TCP streams</span> to reconstruct complete communications.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Look for unusual or suspicious traffic patterns</span> that might indicate hidden data.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Export objects</span> from HTTP, FTP, or other protocols to recover transmitted files.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Analyze DNS queries</span> for potential data exfiltration or command and control communications.
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "binary",
      title: "Binary Exploitation",
      description: "Learn about memory corruption and reverse engineering",
      icon: Cpu,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Binary Exploitation</CardTitle>
              <CardDescription>Understanding memory vulnerabilities and exploitation techniques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Binary exploitation involves identifying and exploiting vulnerabilities in compiled programs. 
                These challenges test your understanding of computer memory, assembly language, and program execution flow.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Binary Exploitation Techniques</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Buffer Overflows</h4>
                  <p className="text-sm text-gray-300">
                    A vulnerability that occurs when a program writes data beyond the allocated memory buffer's boundaries.
                    Attackers can use this vulnerability to overwrite adjacent memory, potentially altering the program's execution flow.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`void vulnerable_function(char *input) {
    char buffer[64]; // Only 64 bytes allocated
    strcpy(buffer, input); // No bounds checking
}`}
                  </pre>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Return-Oriented Programming (ROP)</h4>
                  <p className="text-sm text-gray-300">
                    An exploitation technique that allows attackers to execute code in the presence of security defenses 
                    by chaining together existing code fragments (gadgets) ending with return instructions.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Format String Vulnerabilities</h4>
                  <p className="text-sm text-gray-300">
                    Occur when user-supplied input is used directly as a format string in functions like printf().
                    This can allow attackers to read from and write to arbitrary memory locations.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`// Vulnerable code
printf(user_input); // user_input used as format string

// Secure code
printf("%s", user_input); // Format string is fixed`}
                  </pre>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Heap Exploitation</h4>
                  <p className="text-sm text-gray-300">
                    Involves manipulating dynamically allocated memory to exploit vulnerabilities in memory management,
                    such as use-after-free, double free, and heap overflow bugs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Binary Analysis Tools</CardTitle>
              <CardDescription>Essential tools for reverse engineering and exploitation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">GDB (GNU Debugger)</h4>
                  <p className="text-sm text-gray-300">
                    A powerful debugger for examining program execution, setting breakpoints, and analyzing memory.
                    Extensions like PEDA, GEF, and pwndbg enhance GDB with features specific to exploitation.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`gdb ./vulnerable_program
break main
run
x/20xw $esp  # Examine stack memory
disassemble main`}
                  </pre>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Ghidra</h4>
                  <p className="text-sm text-gray-300">
                    A free and open-source software reverse engineering suite developed by the NSA.
                    Provides disassembly, decompilation, and analysis features to understand binary code.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">IDA Pro</h4>
                  <p className="text-sm text-gray-300">
                    Industry-standard disassembler and debugger used for reverse engineering binary files.
                    Offers interactive and programmable disassembly features and multi-processor support.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Pwntools</h4>
                  <p className="text-sm text-gray-300">
                    A Python library specifically designed for rapid exploit development and CTF participation.
                    Simplifies tasks like connecting to remote services, packing data, and generating shellcode.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`from pwn import *

# Connect to a remote service
conn = remote('example.com', 1337)

# Create a ROP chain
rop = ROP('./vulnerable_binary')
rop.system(next(rop.find_gadget(['sh', 0])))

# Send payload
payload = flat('A' * 64, rop.chain())
conn.sendline(payload)
conn.interactive()`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "reverse",
      title: "Reverse Engineering",
      description: "Learn about disassembling and analyzing compiled code",
      icon: FileCode,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Introduction to Reverse Engineering</CardTitle>
              <CardDescription>Understanding compiled programs and their behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Reverse engineering involves analyzing compiled programs to understand their functionality, 
                identify vulnerabilities, or extract hidden information. In CTF competitions, reverse engineering 
                challenges often require you to understand what a program does without having access to the original source code.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Common Reverse Engineering Concepts</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Assembly Language</h4>
                  <p className="text-sm text-gray-300">
                    A low-level programming language with a strong correspondence between machine code instructions 
                    and the assembly instructions. Understanding assembly is fundamental for reverse engineering.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`; x86 assembly example
mov eax, 5      ; Move value 5 into eax register
add eax, 3      ; Add 3 to eax (eax now = 8)
cmp eax, 10     ; Compare eax with 10
jl label        ; Jump to label if eax < 10`}
                  </pre>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Static Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Examining the program without executing it. This involves disassembling the binary, 
                    analyzing code structure, identifying functions, and understanding control flow.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Dynamic Analysis</h4>
                  <p className="text-sm text-gray-300">
                    Executing the program in a controlled environment to observe its behavior. 
                    This includes monitoring system calls, tracing execution flow, and analyzing memory usage.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Decompilation</h4>
                  <p className="text-sm text-gray-300">
                    Converting compiled machine code back into a higher-level representation that resembles 
                    the original source code. Tools like Ghidra and IDA Pro provide powerful decompilation capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Reverse Engineering Approaches</CardTitle>
              <CardDescription>Strategies for tackling reverse engineering challenges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-3">
                <li className="text-gray-300">
                  <span className="font-medium text-white">Identify the program type</span> - Is it a Windows executable, Linux ELF, or something else?
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Check for obfuscation or packing</span> - Tools like UPX, PEiD, or Detect It Easy can help identify if the program is packed.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Look for strings</span> - Use tools like <code>strings</code> command in Linux to extract readable text that might provide clues.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Use decompilers</span> - Tools like Ghidra can convert assembly code to a higher-level representation that's easier to understand.
                </li>
                <li className="text-gray-300">
                  <span className="font-medium text-white">Identify key functions</span> - Look for functions that handle input validation, cryptographic operations, or flag checking.
                </li>
              </ol>
              
              <div className="glass-panel p-4 mt-4">
                <h4 className="font-bold mb-1">Example Workflow</h4>
                <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                  {`# Basic static analysis steps
file ./unknown_binary      # Determine file type
strings ./unknown_binary   # Extract readable strings
objdump -d ./unknown_binary # Disassemble the binary

# Dynamic analysis
strace ./unknown_binary    # Trace system calls
ltrace ./unknown_binary    # Trace library calls
gdb ./unknown_binary       # Debug the binary`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "mobile",
      title: "Mobile Security",
      description: "Learn about Android and iOS application security",
      icon: FileDigit,
      content: (
        <div className="space-y-6">
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Mobile Application Security</CardTitle>
              <CardDescription>Understanding Android and iOS security models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Mobile security in CTF challenges involves analyzing and exploiting vulnerabilities in Android 
                and iOS applications. This requires understanding mobile application architectures, security 
                mechanisms, and common vulnerabilities.
              </p>
              
              <h3 className="text-lg font-medium text-cyber-blue">Android Application Analysis</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">APK Structure</h4>
                  <p className="text-sm text-gray-300">
                    Android applications (APKs) are essentially ZIP archives containing compiled code (DEX files),
                    resources, assets, and a manifest file that defines application permissions and components.
                  </p>
                  <pre className="mt-2 p-2 bg-black/30 rounded-md text-xs text-gray-300 overflow-x-auto">
                    {`# Extract an APK
apktool d application.apk

# APK structure
AndroidManifest.xml   # Application configuration
classes.dex           # Compiled Java/Kotlin code
res/                  # Resources (layouts, strings, etc.)
assets/               # Raw assets (files, databases, etc.)`}
                  </pre>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Decompiling Android Apps</h4>
                  <p className="text-sm text-gray-300">
                    Reverse engineering Android applications typically involves decompiling DEX code back to Java 
                    source code or smali (an intermediate representation). Tools like jadx, apktool, and dex2jar 
                    are commonly used for this purpose.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Common Android Vulnerabilities</h4>
                  <p className="text-sm text-gray-300">
                    <ul className="list-disc list-inside">
                      <li>Insecure data storage (unencrypted databases, shared preferences)</li>
                      <li>Inadequate cryptography implementation</li>
                      <li>Exported components (Activities, Services, BroadcastReceivers)</li>
                      <li>Insecure WebView configurations</li>
                      <li>Hardcoded credentials and API keys</li>
                    </ul>
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-cyber-blue mt-6">iOS Application Analysis</h3>
              
              <div className="space-y-3">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">IPA Structure</h4>
                  <p className="text-sm text-gray-300">
                    iOS applications (IPAs) are also archives containing compiled code, resources, and configuration files.
                    The main executable is usually compiled to ARM assembly, making analysis more challenging.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Reverse Engineering iOS Apps</h4>
                  <p className="text-sm text-gray-300">
                    Tools like Hopper Disassembler, IDA Pro, and Ghidra can be used to analyze iOS binaries.
                    For runtime analysis, tools like Frida and Cycript are valuable for hooking into app functions.
                  </p>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Common iOS Vulnerabilities</h4>
                  <p className="text-sm text-gray-300">
                    <ul className="list-disc list-inside">
                      <li>Insecure data storage (unencrypted NSUserDefaults, Keychain misuse)</li>
                      <li>Lacking jailbreak detection</li>
                      <li>Insecure local authentication</li>
                      <li>Weak transport layer security</li>
                      <li>Sensitive information in binary files</li>
                    </ul>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-panel border-0">
            <CardHeader>
              <CardTitle>Mobile Security Tools</CardTitle>
              <CardDescription>Essential tools for mobile application analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">Android Tools</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                    <li><strong>Apktool</strong>: Disassembles resources and DEX to smali</li>
                    <li><strong>Jadx</strong>: Decompiles APK files to Java source</li>
                    <li><strong>MobSF</strong>: Automated mobile application security assessment</li>
                    <li><strong>ADB</strong>: Android Debug Bridge for interacting with devices</li>
                    <li><strong>Drozer</strong>: Security assessment framework for Android</li>
                  </ul>
                </div>
                
                <div className="glass-panel p-4">
                  <h4 className="font-bold mb-1">iOS Tools</h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                    <li><strong>Clutch</strong>: Extracts decrypted IPAs from jailbroken devices</li>
                    <li><strong>Frida</strong>: Dynamic instrumentation toolkit</li>
                    <li><strong>Cydia Impactor</strong>: Installs IPAs on non-jailbroken devices</li>
                    <li><strong>Hopper</strong>: Disassembler and decompiler for iOS binaries</li>
                    <li><strong>iProxy</strong>: Proxy connections for iOS analysis</li>
                  </ul>
                </div>
              </div>
