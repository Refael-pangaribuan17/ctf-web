
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { NetworkIcon, Search, RotateCcw, Copy, ExternalLink, MapPin, Globe, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ReconTool: React.FC = () => {
  const [target, setTarget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('whois');
  const [results, setResults] = useState<{
    whois: Record<string, string> | null;
    dns: Record<string, string[]> | null;
    ports: {port: number, service: string, state: string}[] | null;
    geoip: {
      ip: string;
      city: string;
      country: string;
      timezone: string;
      latitude: number;
      longitude: number;
      isp: string;
    } | null;
  }>({
    whois: null,
    dns: null,
    ports: null,
    geoip: null
  });
  const { toast } = useToast();

  const extractDomain = (url: string) => {
    try {
      // If it's already a domain without protocol, just return it
      if (!url.includes('://') && !url.includes(' ')) {
        return url.trim();
      }
      
      // Try to parse as URL
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      return parsed.hostname;
    } catch (e) {
      // Return original if can't parse
      return url.trim();
    }
  };

  const handleReset = () => {
    setTarget('');
    setResults({
      whois: null,
      dns: null,
      ports: null,
      geoip: null
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!target) {
      toast({
        title: "Target Required",
        description: "Please enter a domain, IP address, or URL to scan.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API request with timeout
    setTimeout(() => {
      const domain = extractDomain(target);
      const fakeWhoisData = {
        "Domain Name": domain,
        "Registry Domain ID": `${Math.random().toString(36).substring(2, 15)}_DOMAIN_COM-VRSN`,
        "Registrar WHOIS Server": "whois.registrar.com",
        "Registrar URL": "http://www.registrar.com",
        "Updated Date": "2022-09-15T08:30:45Z",
        "Creation Date": "2005-03-28T07:12:25Z",
        "Registrar Registration Expiration Date": "2023-03-28T07:12:25Z",
        "Registrar": "Some Registrar, Inc.",
        "Registrar Abuse Contact Email": `abuse@${domain}`,
        "Registrar Abuse Contact Phone": "+1.5555555555",
        "Domain Status": "clientTransferProhibited",
        "Registry Registrant ID": `RT_${Math.random().toString(36).substring(2, 8)}`,
        "Registrant Name": "Domain Administrator",
        "Registrant Organization": `${domain.split('.')[0].toUpperCase()} CORPORATION`,
        "Registrant Street": "123 Example St",
        "Registrant City": "Anytown",
        "Registrant State/Province": "CA",
        "Registrant Postal Code": "90210",
        "Registrant Country": "US",
        "Registrant Phone": "+1.5555551234",
        "Registrant Email": `admin@${domain}`,
        "Name Server 1": `ns1.${domain}`,
        "Name Server 2": `ns2.${domain}`,
      };
      
      const fakeDnsData = {
        "A": [`203.0.113.${Math.floor(Math.random() * 255)}`, `203.0.113.${Math.floor(Math.random() * 255)}`],
        "AAAA": [`2001:db8::${Math.floor(Math.random() * 9999)}`, `2001:db8::${Math.floor(Math.random() * 9999)}`],
        "MX": [`mail.${domain}`, `mail2.${domain}`],
        "NS": [`ns1.${domain}`, `ns2.${domain}`],
        "TXT": [`v=spf1 include:_spf.${domain} ~all`, `google-site-verification=${Math.random().toString(36).substring(2, 15)}`],
        "CNAME": [`www.${domain}`],
        "SOA": [`ns1.${domain} hostmaster.${domain} ${Date.now()} 10800 3600 604800 38400`]
      };
      
      const fakePortsData = [
        { port: 80, service: "HTTP", state: "open" },
        { port: 443, service: "HTTPS", state: "open" },
        { port: 21, service: "FTP", state: "closed" },
        { port: 22, service: "SSH", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 25, service: "SMTP", state: Math.random() > 0.5 ? "open" : "filtered" },
        { port: 53, service: "DNS", state: Math.random() > 0.7 ? "open" : "closed" },
        { port: 110, service: "POP3", state: "closed" },
        { port: 143, service: "IMAP", state: "closed" },
        { port: 3306, service: "MySQL", state: "filtered" },
        { port: 8080, service: "HTTP-Proxy", state: Math.random() > 0.8 ? "open" : "closed" },
      ];
      
      const fakeGeoIpData = {
        ip: `203.0.113.${Math.floor(Math.random() * 255)}`,
        city: ["New York", "London", "Tokyo", "Sydney", "Berlin"][Math.floor(Math.random() * 5)],
        country: ["United States", "United Kingdom", "Japan", "Australia", "Germany"][Math.floor(Math.random() * 5)],
        timezone: ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney", "Europe/Berlin"][Math.floor(Math.random() * 5)],
        latitude: (Math.random() * 180 - 90).toFixed(4),
        longitude: (Math.random() * 360 - 180).toFixed(4),
        isp: ["Cloudflare", "Amazon AWS", "Google Cloud", "Microsoft Azure", "Digital Ocean"][Math.floor(Math.random() * 5)],
      };
      
      // Set all results at once
      setResults({
        whois: fakeWhoisData,
        dns: fakeDnsData,
        ports: fakePortsData,
        geoip: fakeGeoIpData
      });
      
      setIsLoading(false);
      
      toast({
        title: "Reconnaissance Complete",
        description: `Successfully gathered information for ${domain}`,
      });
    }, 2000);
  };

  const handleCopy = (data: any) => {
    let textToCopy = '';
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        textToCopy = data.map(item => {
          if (typeof item === 'object') {
            return Object.entries(item).map(([key, value]) => `${key}: ${value}`).join('\n');
          }
          return item;
        }).join('\n');
      } else {
        textToCopy = Object.entries(data).map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(', ')}`;
          }
          return `${key}: ${value}`;
        }).join('\n');
      }
    } else {
      textToCopy = String(data);
    }
    
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied to clipboard",
      description: "The data has been copied to your clipboard.",
    });
  };

  return (
    <div className="animate-fade-up w-full max-w-4xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <NetworkIcon className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Network Reconnaissance Tool</h2>
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

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Label htmlFor="target" className="text-sm mb-2 block text-gray-300">
                Domain, IP Address, or URL
              </Label>
              <Input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., example.com, 192.168.1.1, https://example.com"
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-cyber-blue hover:bg-cyber-blue/80 w-full md:w-auto"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                ) : (
                  <Search className="mr-1 h-4 w-4" />
                )}
                {isLoading ? "Scanning..." : "Scan Target"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Note: This tool performs passive reconnaissance without sending packets to the target. All scans comply with legal and ethical guidelines.
          </p>
        </form>

        {(results.whois || results.dns || results.ports || results.geoip) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="whois">WHOIS</TabsTrigger>
              <TabsTrigger value="dns">DNS Records</TabsTrigger>
              <TabsTrigger value="ports">Port Scan</TabsTrigger>
              <TabsTrigger value="geoip">GeoIP</TabsTrigger>
            </TabsList>
            
            {/* WHOIS Tab */}
            <TabsContent value="whois" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">WHOIS Information</h3>
                {results.whois && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(results.whois)}
                    className="text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy All
                  </Button>
                )}
              </div>
              
              {results.whois && (
                <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 divide-y divide-cyber-dark">
                    {Object.entries(results.whois).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-1 md:grid-cols-3 p-2">
                        <div className="text-sm font-medium text-gray-300 md:col-span-1">{key}</div>
                        <div className="text-sm font-mono break-all md:col-span-2">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* DNS Tab */}
            <TabsContent value="dns" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">DNS Records</h3>
                {results.dns && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(results.dns)}
                    className="text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy All
                  </Button>
                )}
              </div>
              
              {results.dns && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(results.dns).map(([recordType, values]) => (
                    <div key={recordType} className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                      <div className="p-2 border-b border-cyber-dark bg-cyber-blue/10">
                        <h4 className="font-medium">{recordType} Records</h4>
                      </div>
                      <div className="p-3">
                        <ul className="space-y-2">
                          {values.map((value, index) => (
                            <li key={index} className="font-mono text-sm break-all">{value}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Ports Tab */}
            <TabsContent value="ports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Port Scan Results</h3>
                {results.ports && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(results.ports)}
                    className="text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy All
                  </Button>
                )}
              </div>
              
              {results.ports && (
                <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-cyber-dark">
                    <thead className="bg-cyber-blue/10">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Port</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-dark">
                      {results.ports.map((port, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">{port.port}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">{port.service}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              port.state === 'open' ? 'bg-green-900/30 text-green-400' :
                              port.state === 'closed' ? 'bg-red-900/30 text-red-400' :
                              'bg-yellow-900/30 text-yellow-400'
                            }`}>
                              {port.state}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="p-3 border border-blue-500/30 bg-blue-900/20 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-blue-400 mb-1">This is a simulation</p>
                    <p>In a real security tool, active port scanning would require proper authorization from the target owner. Unauthorized port scanning may be illegal in some jurisdictions.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* GeoIP Tab */}
            <TabsContent value="geoip" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Geographic Location</h3>
                {results.geoip && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(results.geoip)}
                    className="text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy All
                  </Button>
                )}
              </div>
              
              {results.geoip && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <div className="p-2 border-b border-cyber-dark bg-cyber-blue/10">
                      <h4 className="font-medium flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-cyber-blue" />
                        Location Details
                      </h4>
                    </div>
                    <div className="p-3">
                      <div className="space-y-2">
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">IP Address:</span>
                          <span className="text-sm font-mono">{results.geoip.ip}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">City:</span>
                          <span className="text-sm">{results.geoip.city}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">Country:</span>
                          <span className="text-sm">{results.geoip.country}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">Timezone:</span>
                          <span className="text-sm">{results.geoip.timezone}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">ISP:</span>
                          <span className="text-sm">{results.geoip.isp}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-sm text-gray-400">Coordinates:</span>
                          <span className="text-sm font-mono">
                            {results.geoip.latitude}, {results.geoip.longitude}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden flex items-center justify-center p-4 min-h-[200px]">
                    <div className="text-center">
                      <Globe className="h-16 w-16 mx-auto mb-2 text-cyber-blue/50" />
                      <p className="text-sm text-gray-400">Interactive map would be displayed here.</p>
                      <p className="text-xs text-gray-500 mt-2">Coordinates: {results.geoip.latitude}, {results.geoip.longitude}</p>
                      <Button className="mt-4 text-xs" variant="outline" size="sm" asChild>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${results.geoip.latitude},${results.geoip.longitude}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ReconTool;
