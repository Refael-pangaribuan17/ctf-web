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
      if (!url.includes('://') && !url.includes(' ')) {
        return url.trim();
      }
      
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      return parsed.hostname;
    } catch (e) {
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
    
    setTimeout(() => {
      const domain = extractDomain(target);
      
      const fakeWhoisData = {
        "Domain Name": domain,
        "Registry Domain ID": `${domain.replace(/\./g, "")}-DOMAIN-COM-VRSN`,
        "Registrar WHOIS Server": "whois.registrar.com",
        "Registrar URL": "http://www.registrar.com",
        "Updated Date": "2023-04-15T08:30:45Z",
        "Creation Date": "2010-03-28T07:12:25Z",
        "Registrar Registration Expiration Date": "2025-03-28T07:12:25Z",
        "Registrar": "Example Registrar, Inc.",
        "Registrar Abuse Contact Email": `abuse@${domain}`,
        "Registrar Abuse Contact Phone": "+1.5555555555",
        "Domain Status": "clientTransferProhibited",
        "Registry Registrant ID": `RT_${domain.replace(/\./g, "")}`,
        "Registrant Name": "Domain Administrator",
        "Registrant Organization": `${domain.split('.')[0].toUpperCase()} ORGANIZATION`,
        "Registrant Street": "123 Business Street",
        "Registrant City": "San Francisco",
        "Registrant State/Province": "CA",
        "Registrant Postal Code": "94105",
        "Registrant Country": "US",
        "Registrant Phone": "+1.5555551234",
        "Registrant Email": `admin@${domain}`,
        "Name Server 1": `ns1.${domain}`,
        "Name Server 2": `ns2.${domain}`
      };
      
      const fakeDnsData = {
        "A": [`104.21.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`, `172.67.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
        "AAAA": [`2606:4700:3030::${Math.floor(Math.random() * 9999)}:${Math.floor(Math.random() * 9999)}`, `2606:4700:3031::${Math.floor(Math.random() * 9999)}:${Math.floor(Math.random() * 9999)}`],
        "MX": [`alt1.aspmx.l.google.com.`, `alt2.aspmx.l.google.com.`],
        "NS": [`ns1.${domain}`, `ns2.${domain}`],
        "TXT": [`v=spf1 include:_spf.google.com include:sendgrid.net ~all`, `google-site-verification=Jd4r-GszEpuG3BSIBxFwZcrvVzrKuDAA5-EnPbPdkjI`],
        "CAA": [`0 issue "letsencrypt.org"`, `0 issue "pki.goog"`],
        "SOA": [`ns1.${domain} hostmaster.${domain} ${Math.floor(Date.now()/1000)} 10800 3600 604800 38400`]
      };
      
      const fakePortsData = [
        { port: 80, service: "HTTP", state: "open" },
        { port: 443, service: "HTTPS", state: "open" },
        { port: 21, service: "FTP", state: "closed" },
        { port: 22, service: "SSH", state: domain.includes('github') ? "open" : "filtered" },
        { port: 25, service: "SMTP", state: domain.includes('mail') ? "open" : "filtered" },
        { port: 53, service: "DNS", state: domain.includes('ns') ? "open" : "closed" },
        { port: 110, service: "POP3", state: "closed" },
        { port: 143, service: "IMAP", state: "closed" },
        { port: 3306, service: "MySQL", state: "filtered" },
        { port: 8080, service: "HTTP-Proxy", state: "closed" },
      ];
      
      const ipParts = domain.split('.');
      const fakeIp = `${ipParts.length > 1 ? '104.21' : '192.168'}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

      let geoData = {
        ip: fakeIp,
        city: "San Francisco",
        country: "United States",
        timezone: "America/Los_Angeles",
        latitude: 37.7749,
        longitude: -122.4194,
        isp: "Cloudflare, Inc."
      };
      
      if (domain.endsWith('.uk')) {
        geoData = {
          ip: fakeIp,
          city: "London",
          country: "United Kingdom",
          timezone: "Europe/London",
          latitude: 51.5074,
          longitude: -0.1278,
          isp: "British Telecom"
        };
      } else if (domain.endsWith('.jp')) {
        geoData = {
          ip: fakeIp,
          city: "Tokyo",
          country: "Japan",
          timezone: "Asia/Tokyo",
          latitude: 35.6762,
          longitude: 139.6503,
          isp: "NTT Communications"
        };
      } else if (domain.endsWith('.de')) {
        geoData = {
          ip: fakeIp,
          city: "Berlin",
          country: "Germany",
          timezone: "Europe/Berlin",
          latitude: 52.5200,
          longitude: 13.4050,
          isp: "Deutsche Telekom"
        };
      } else if (domain.endsWith('.au')) {
        geoData = {
          ip: fakeIp,
          city: "Sydney",
          country: "Australia",
          timezone: "Australia/Sydney",
          latitude: -33.8688,
          longitude: 151.2093,
          isp: "Telstra Corporation"
        };
      }
      
      setResults({
        whois: fakeWhoisData,
        dns: fakeDnsData,
        ports: fakePortsData,
        geoip: geoData
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
            Note: This tool performs simulated reconnaissance for educational purposes only.
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
                          <span className="text-sm font-mono">{results.geoip.latitude}, {results.geoip.longitude}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <div className="p-2 border-b border-cyber-dark bg-cyber-blue/10">
                      <h4 className="font-medium flex items-center">
                        <Globe className="h-4 w-4 mr-1 text-cyber-blue" />
                        Map View
                      </h4>
                    </div>
                    <div className="p-3 h-48 bg-gray-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-2 text-cyber-blue">
                          <MapPin className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-400">
                          Location: {results.geoip.city}, {results.geoip.country}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ({results.geoip.latitude}, {results.geoip.longitude})
                        </p>
                      </div>
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

