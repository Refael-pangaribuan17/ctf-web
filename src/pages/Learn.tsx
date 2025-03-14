
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Key, Shield, Terminal, Network, Globe, Code, Database, Wifi } from 'lucide-react';
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
    }
  ];

  return (
    <main className="min-h-screen pb-20">
      <BackgroundAnimation />
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Learn CTF Basics</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore the fundamentals of Capture The Flag competitions and build your cybersecurity skills.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto animate-fade-up animate-delay-200">
          <Tabs defaultValue="crypto" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
              {sections.map((section) => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className={cn(
                    "data-[state=active]:text-cyber-blue data-[state=active]:bg-cyber-blue/10",
                    "flex items-center gap-2"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  <span>{section.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-6">
                {section.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default Learn;
