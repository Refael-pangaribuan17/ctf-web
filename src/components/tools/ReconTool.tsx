
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Search, Server, Database, Globe, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const ReconTool: React.FC = () => {
  const [target, setTarget] = useState('');
  const [dnsRecords, setDnsRecords] = useState<Array<{ type: string; value: string }>>([]);
  const [whoisData, setWhoisData] = useState<Record<string, string> | null>(null);
  const [ports, setPorts] = useState<Array<{ port: number; service: string; state: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commonPorts, setCommonPorts] = useState(true);
  const [fullScan, setFullScan] = useState(false);
  const { toast } = useToast();

  const handleDnsLookup = () => {
    if (!validateTarget()) return;

    setIsLoading(true);
    setDnsRecords([]);

    // Simulate DNS lookup
    setTimeout(() => {
      const domain = extractDomain(target);
      const fakeDnsRecords = [
        { type: 'A', value: '192.168.1.1' },
        { type: 'AAAA', value: '2001:0db8:85a3:0000:0000:8a2e:0370:7334' },
        { type: 'MX', value: `mail.${domain} (priority: 10)` },
        { type: 'NS', value: `ns1.${domain}` },
        { type: 'NS', value: `ns2.${domain}` },
        { type: 'CNAME', value: `www.${domain} -> ${domain}` },
        { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all' },
        { type: 'SOA', value: `ns1.${domain} admin.${domain} 2023011301 3600 1800 604800 86400` }
      ];

      setDnsRecords(fakeDnsRecords);
      setIsLoading(false);

      toast({
        title: "DNS Lookup Complete",
        description: `Found ${fakeDnsRecords.length} DNS records for ${domain}.`,
      });
    }, 2000);
  };

  const handleWhoisLookup = () => {
    if (!validateTarget()) return;

    setIsLoading(true);
    setWhoisData(null);

    // Simulate WHOIS lookup
    setTimeout(() => {
      const domain = extractDomain(target);
      const fakeWhoisData = {
        "Domain Name": domain,
        "Registry Domain ID": `${Math.random().toString(36).substring(2, 15)}_DOMAIN_COM-VRSN`,
        "Registrar WHOIS Server": "whois.registrar.com",
        "Registrar URL": "http://www.registrar.com",
        "Updated Date": "2022-09-15T08:30:45Z",
        "Creation Date": "2001-03-22T13:45:07Z",
        "Registrar": "Example Registrar, LLC",
        "Registrar IANA ID": "1234567",
        "Registrar Abuse Contact Email": `abuse@${domain}`,
        "Registrar Abuse Contact Phone": "+1.5555555555",
        "Domain Status": "clientTransferProhibited",
        "Registry Registrant ID": `RT_${Math.random().toString(36).substring(2, 8)}`,
        "Registrant Name": "Domain Administrator",
        "Registrant Organization": `${domain.split('.')[0].toUpperCase()} CORPORATION`,
        "Registrant Street": "123 Example St",
        "Registrant City": "Anytown",
        "Registrant State/Province": "CA",
        "Registrant Postal Code": "94105",
        "Registrant Country": "US",
        "Registrant Phone": "+1.5555555555",
        "Registrant Email": `admin@${domain}`,
        "Name Server 1": `ns1.${domain}`,
        "Name Server 2": `ns2.${domain}`,
        "DNSSEC": "unsigned"
      };

      setWhoisData(fakeWhoisData);
      setIsLoading(false);

      toast({
        title: "WHOIS Lookup Complete",
        description: `Retrieved WHOIS information for ${domain}.`,
      });
    }, 2500);
  };

  const handlePortScan = () => {
    if (!validateTarget()) return;

    setIsLoading(true);
    setPorts([]);

    // Simulate port scanning
    setTimeout(() => {
      const commonPortList = [
        { port: 21, service: "FTP", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 22, service: "SSH", state: Math.random() > 0.5 ? "open" : "closed" },
        { port: 23, service: "Telnet", state: Math.random() > 0.8 ? "open" : "closed" },
        { port: 25, service: "SMTP", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 53, service: "DNS", state: Math.random() > 0.6 ? "open" : "closed" },
        { port: 80, service: "HTTP", state: "open" },
        { port: 110, service: "POP3", state: Math.random() > 0.8 ? "open" : "closed" },
        { port: 143, service: "IMAP", state: Math.random() > 0.8 ? "open" : "closed" },
        { port: 443, service: "HTTPS", state: "open" },
        { port: 445, service: "SMB", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 3306, service: "MySQL", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 3389, service: "RDP", state: Math.random() > 0.8 ? "open" : "closed" }
      ];

      // Add some random additional ports if full scan is selected
      const additionalPorts = fullScan
        ? [
            { port: 1433, service: "MSSQL", state: Math.random() > 0.8 ? "open" : "closed" },
            { port: 1521, service: "Oracle", state: Math.random() > 0.8 ? "open" : "closed" },
            { port: 5432, service: "PostgreSQL", state: Math.random() > 0.8 ? "open" : "closed" },
            { port: 8080, service: "HTTP-Proxy", state: Math.random() > 0.6 ? "open" : "closed" },
            { port: 8443, service: "HTTPS-Alt", state: Math.random() > 0.7 ? "open" : "closed" },
            { port: 27017, service: "MongoDB", state: Math.random() > 0.8 ? "open" : "closed" }
          ]
        : [];

      const selectedPorts = commonPorts 
        ? [...commonPortList, ...additionalPorts]
        : additionalPorts.length > 0 
          ? additionalPorts
          : [{ port: 80, service: "HTTP", state: "open" }]; // Ensure at least one port is displayed

      setPorts(selectedPorts);
      setIsLoading(false);

      const openPorts = selectedPorts.filter(p => p.state === "open").length;
      toast({
        title: "Port Scan Complete",
        description: `Scanned ${selectedPorts.length} ports, found ${openPorts} open ports.`,
      });
    }, 3000);
  };

  const validateTarget = () => {
    if (!target) {
      toast({
        title: "Target Required",
        description: "Please enter a target domain or IP address.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const extractDomain = (url: string) => {
    // Simple extraction of domain from URL or just return the input if it looks like a domain
    try {
      if (url.startsWith('http')) {
        return new URL(url).hostname;
      }
      return url.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const handleReset = () => {
    setTarget('');
    setDnsRecords([]);
    setWhoisData(null);
    setPorts([]);
    setCommonPorts(true);
    setFullScan(false);
  };

  const handleCopy = (data: any) => {
    let textToCopy = '';
    
    if (Array.isArray(data)) {
      textToCopy = data.map(item => {
        if ('type' in item && 'value' in item) {
          return `${item.type}: ${item.value}`;
        } else if ('port' in item) {
          return `${item.port}/tcp ${item.state} ${item.service}`;
        }
        return JSON.stringify(item);
      }).join('\n');
    } else if (typeof data === 'object' && data !== null) {
      textToCopy = Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied to clipboard",
        description: "The data has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Search className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Reconnaissance Tool</h2>
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
            <Label htmlFor="target" className="text-sm mb-2 block text-gray-300">
              Target Domain or IP
            </Label>
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="example.com or 192.168.1.1"
              className="font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter a domain name or IP address for reconnaissance
            </p>
          </div>
          
          <Tabs defaultValue="dns" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="dns">DNS Lookup</TabsTrigger>
              <TabsTrigger value="whois">WHOIS</TabsTrigger>
              <TabsTrigger value="port">Port Scan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dns" className="space-y-4">
              <Button
                onClick={handleDnsLookup}
                disabled={isLoading}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    Looking up DNS records...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Lookup DNS Records
                  </>
                )}
              </Button>
              
              {dnsRecords.length > 0 && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      DNS Records
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(dnsRecords)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-cyber-dark/50">
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dnsRecords.map((record, index) => (
                          <tr 
                            key={index} 
                            className="border-t border-cyber-dark/50"
                          >
                            <td className="px-4 py-2 font-medium">{record.type}</td>
                            <td className="px-4 py-2 font-mono text-xs break-all">{record.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="whois" className="space-y-4">
              <Button
                onClick={handleWhoisLookup}
                disabled={isLoading}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    Looking up WHOIS data...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Lookup WHOIS Information
                  </>
                )}
              </Button>
              
              {whoisData && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      WHOIS Information
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(whoisData)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <div className="p-4 bg-cyber-dark/20 border-b border-cyber-dark">
                      <h3 className="text-cyber-blue font-medium">{whoisData["Domain Name"]}</h3>
                    </div>
                    <div className="p-4">
                      <table className="w-full text-sm">
                        <tbody>
                          {Object.entries(whoisData).map(([key, value], index) => (
                            <tr 
                              key={index} 
                              className={index !== 0 ? "border-t border-cyber-dark/30" : ""}
                            >
                              <td className="py-2 pr-4 font-medium text-gray-300 whitespace-nowrap align-top">
                                {key}
                              </td>
                              <td className="py-2 pl-4 font-mono text-xs break-all">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="port" className="space-y-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="common-ports" 
                    checked={commonPorts}
                    onCheckedChange={(checked) => setCommonPorts(checked as boolean)}
                  />
                  <label
                    htmlFor="common-ports"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Scan common ports (21, 22, 23, 25, 80, 443, etc.)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="full-scan" 
                    checked={fullScan}
                    onCheckedChange={(checked) => setFullScan(checked as boolean)}
                  />
                  <label
                    htmlFor="full-scan"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include additional ports (1433, 3306, 5432, 8080, etc.)
                  </label>
                </div>
                
                <Button
                  onClick={handlePortScan}
                  disabled={isLoading}
                  className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                      Scanning ports...
                    </>
                  ) : (
                    <>
                      <Server className="h-4 w-4 mr-2" />
                      Scan Ports
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-400">
                  Note: This is a simulated port scan for educational purposes only. No actual scanning is performed.
                </p>
              </div>
              
              {ports.length > 0 && (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      Port Scan Results
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(ports)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-cyber-dark/50">
                          <th className="px-4 py-2 text-left">Port</th>
                          <th className="px-4 py-2 text-left">Service</th>
                          <th className="px-4 py-2 text-left">State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ports.map((port, index) => (
                          <tr 
                            key={index} 
                            className={`border-t border-cyber-dark/50 ${
                              port.state === 'open' ? 'bg-green-900/10' : ''
                            }`}
                          >
                            <td className="px-4 py-2 font-mono">{port.port}/tcp</td>
                            <td className="px-4 py-2">{port.service}</td>
                            <td className={`px-4 py-2 font-medium ${
                              port.state === 'open' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {port.state}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReconTool;
