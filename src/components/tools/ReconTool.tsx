
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, RotateCcw, Copy, Server } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Utility to validate domain format
const isValidDomain = (domain: string) => {
  const pattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return pattern.test(domain);
};

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

interface GeoIPData {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
}

interface PortData {
  port: number;
  service: string;
  state: string;
}

const ReconTool: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [geoIPData, setGeoIPData] = useState<GeoIPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dns');
  const [portResults, setPortResults] = useState<PortData[]>([]);
  const [whoisData, setWhoisData] = useState<string>('');
  const { toast } = useToast();

  const fetchDNSRecords = async (domain: string): Promise<DNSRecord[]> => {
    // Use a public API service that supports CORS
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
        headers: {
          'Accept': 'application/dns-json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.Answer || data.Answer.length === 0) {
        // Try ipinfo.io as fallback for A records
        const ipinfoResponse = await fetch(`https://ipinfo.io/${domain}/json`);
        if (ipinfoResponse.ok) {
          const ipData = await ipinfoResponse.json();
          if (ipData.ip) {
            return [{
              type: 'A',
              name: domain,
              value: ipData.ip,
              ttl: 300
            }];
          }
        }
        throw new Error('No DNS records found');
      }
      
      // Transform Google DNS API response to our format
      return data.Answer.map((record: any) => ({
        type: record.type === 1 ? 'A' : 
              record.type === 5 ? 'CNAME' : 
              record.type === 28 ? 'AAAA' : 
              record.type === 15 ? 'MX' : 
              record.type === 16 ? 'TXT' : 
              record.type === 2 ? 'NS' : 
              `Type ${record.type}`,
        name: record.name,
        value: record.data,
        ttl: record.TTL
      }));
    } catch (error) {
      // Try alternative DNS resolver
      try {
        // Try with ipapi.co which supports CORS
        const ipapiResponse = await fetch(`https://ipapi.co/${domain}/json/`);
        if (ipapiResponse.ok) {
          const ipData = await ipapiResponse.json();
          if (ipData.ip && !ipData.error) {
            return [{
              type: 'A',
              name: domain,
              value: ipData.ip,
              ttl: 300
            }];
          }
        }
        
        // Try another direct approach with domain-ip.info
        const domainIpResponse = await fetch(`https://api.domainsdb.info/v1/domains/search?domain=${domain}`);
        if (domainIpResponse.ok) {
          const domainData = await domainIpResponse.json();
          if (domainData.domains && domainData.domains.length > 0) {
            return domainData.domains.map((item: any) => ({
              type: 'A',
              name: item.domain,
              value: item.A || "No IP available",
              ttl: 300
            }));
          }
        }
      } catch (fallbackError) {
        console.error("Fallback DNS resolution failed:", fallbackError);
      }
      
      // Final fallback - use ipinfo.io with the domain directly
      try {
        const response = await fetch(`https://ipinfo.io/${encodeURIComponent(domain)}/json`);
        if (response.ok) {
          const data = await response.json();
          if (data.ip) {
            return [{
              type: 'A',
              name: domain,
              value: data.ip,
              ttl: 300
            }];
          }
        }
      } catch (err) {
        console.error("All DNS resolution attempts failed");
      }
      
      throw new Error('Unable to fetch DNS records due to CORS restrictions. Try using a browser extension or server-side tool.');
    }
  };

  const fetchGeoIPData = async (domain: string): Promise<GeoIPData> => {
    // First try to get IP from our DNS records
    let ip = '';
    const dnsRecord = dnsRecords.find(record => record.type === 'A');
    if (dnsRecord) {
      ip = dnsRecord.value;
    } else {
      // Try to resolve it directly
      try {
        const ipinfoResponse = await fetch(`https://ipinfo.io/${domain}/json`);
        if (ipinfoResponse.ok) {
          const ipData = await ipinfoResponse.json();
          if (ipData.ip) {
            ip = ipData.ip;
          }
        }
      } catch (error) {
        console.error("Error resolving IP:", error);
      }
    }

    if (!ip) {
      // Try to get IP from ipapi
      try {
        const ipapiResponse = await fetch(`https://ipapi.co/${domain}/json/`);
        if (ipapiResponse.ok) {
          const ipData = await ipapiResponse.json();
          if (ipData.ip && !ipData.error) {
            ip = ipData.ip;
          }
        }
      } catch (error) {
        console.error("Error resolving IP from ipapi:", error);
      }
    }

    if (!ip) {
      throw new Error('Could not resolve IP address for this domain');
    }

    // Now use ipinfo.io to get detailed GeoIP data
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        ip: data.ip,
        hostname: data.hostname,
        city: data.city,
        region: data.region,
        country: data.country,
        loc: data.loc,
        org: data.org,
        postal: data.postal,
        timezone: data.timezone
      };
    } catch (error) {
      // Fallback to ipapi.co
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.reason || 'API error');
        }
        
        return {
          ip: data.ip,
          city: data.city,
          region: data.region_name,
          country: data.country_name,
          loc: `${data.latitude},${data.longitude}`,
          org: data.org,
          timezone: data.timezone
        };
      } catch (fallbackError) {
        console.error("Fallback GeoIP lookup failed:", fallbackError);
        throw new Error('Failed to retrieve GeoIP data');
      }
    }
  };

  const simulateWHOISLookup = (domain: string): string => {
    // WHOIS lookups cannot be done client-side due to CORS, so we'll explain this
    return `
Domain Name: ${domain.toUpperCase()}

NOTE: Real WHOIS lookups cannot be performed directly in the browser due to CORS limitations.

To perform an actual WHOIS lookup, you can:
1. Use a command-line tool like 'whois' on Linux/Mac or online WHOIS services
2. Visit https://whois.domaintools.com/${domain} 
3. Visit https://www.whois.com/whois/${domain}

A WHOIS query provides domain registration information including:
- Registrar information
- Domain creation and expiration dates
- Name servers
- Registrant contact information (if not private)
- Administrative and technical contacts
`;
  };

  const simulatePortScan = (domain: string): PortData[] => {
    // Port scanning cannot be done client-side, so we'll explain this
    const commonPorts: PortData[] = [
      { port: 80, service: 'HTTP', state: 'Browser limits' },
      { port: 443, service: 'HTTPS', state: 'Browser limits' },
      { port: 21, service: 'FTP', state: 'Browser limits' },
      { port: 22, service: 'SSH', state: 'Browser limits' },
      { port: 25, service: 'SMTP', state: 'Browser limits' }
    ];
    
    return commonPorts;
  };

  const handleSubmit = async () => {
    if (!domain) {
      toast({
        title: "Domain Required",
        description: "Please enter a domain to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic domain format validation
    if (!isValidDomain(domain)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain name (e.g., example.com).",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setDnsRecords([]);
    setGeoIPData(null);
    setPortResults([]);
    setWhoisData('');
    
    try {
      // Process the selected tab
      if (activeTab === 'dns' || activeTab === 'geoip') {
        // DNS lookups are needed for both DNS and GeoIP tabs
        const records = await fetchDNSRecords(domain);
        setDnsRecords(records);
        
        if (activeTab === 'geoip') {
          try {
            const geoData = await fetchGeoIPData(domain);
            setGeoIPData(geoData);
          } catch (geoError) {
            console.error("GeoIP fetch error:", geoError);
            toast({
              title: "GeoIP Lookup Failed",
              description: geoError instanceof Error ? geoError.message : "Failed to retrieve geolocation data.",
              variant: "destructive",
            });
          }
        }
      } else if (activeTab === 'whois') {
        const whoisInfo = simulateWHOISLookup(domain);
        setWhoisData(whoisInfo);
      } else if (activeTab === 'portscan') {
        const portInfo = simulatePortScan(domain);
        setPortResults(portInfo);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Reconnaissance data retrieved for ${domain}`,
      });
    } catch (error) {
      console.error("Recon error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to retrieve reconnaissance data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDomain('');
    setDnsRecords([]);
    setGeoIPData(null);
    setPortResults([]);
    setWhoisData('');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "The data has been copied to your clipboard.",
    });
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Search className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Network Reconnaissance</h2>
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
          {/* Domain input */}
          <div className="w-full">
            <Label htmlFor="domain" className="text-sm mb-2 block text-gray-300">
              Target Domain
            </Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full" />
                ) : (
                  <>
                    <Search className="mr-1 h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter a domain name to perform reconnaissance
            </p>
          </div>

          {/* Tabs for different recon types */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-6">
              <TabsTrigger value="dns">DNS</TabsTrigger>
              <TabsTrigger value="geoip">GeoIP</TabsTrigger>
              <TabsTrigger value="whois">WHOIS</TabsTrigger>
              <TabsTrigger value="portscan">Port Scan</TabsTrigger>
            </TabsList>
            
            {/* DNS Records Tab */}
            <TabsContent value="dns" className="space-y-4">
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    DNS Records
                  </Label>
                  {dnsRecords.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(JSON.stringify(dnsRecords, null, 2))}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md min-h-[200px]">
                  {dnsRecords.length > 0 ? (
                    <div className="space-y-2">
                      {dnsRecords.map((record, index) => (
                        <div key={index} className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="flex justify-between">
                            <span className="text-cyber-blue">{record.type}</span>
                            <span className="text-gray-400 text-sm">TTL: {record.ttl || 'N/A'}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm text-gray-300">{record.name}</span>
                          </div>
                          <div className="mt-1 font-mono text-sm break-all">
                            {record.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {isLoading ? "Fetching DNS records..." : "DNS records will appear here after analysis"}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Note: Some DNS record types may not be available due to browser API limitations
                </p>
              </div>
            </TabsContent>
            
            {/* GeoIP Tab */}
            <TabsContent value="geoip" className="space-y-4">
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Geolocation Data
                  </Label>
                  {geoIPData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(JSON.stringify(geoIPData, null, 2))}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md min-h-[200px]">
                  {geoIPData ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">IP Address</div>
                          <div className="font-mono">{geoIPData.ip}</div>
                        </div>
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">Hostname</div>
                          <div className="font-mono text-sm break-all">{geoIPData.hostname || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">City</div>
                          <div>{geoIPData.city || 'N/A'}</div>
                        </div>
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">Region</div>
                          <div>{geoIPData.region || 'N/A'}</div>
                        </div>
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">Country</div>
                          <div>{geoIPData.country || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                        <div className="text-xs text-gray-400">Organization</div>
                        <div className="text-sm break-all">{geoIPData.org || 'N/A'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">Timezone</div>
                          <div>{geoIPData.timezone || 'N/A'}</div>
                        </div>
                        <div className="p-2 border border-cyber-dark/50 rounded bg-black/20">
                          <div className="text-xs text-gray-400">Coordinates</div>
                          <div className="font-mono text-sm">{geoIPData.loc || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {isLoading ? "Fetching geolocation data..." : "Geolocation data will appear here after analysis"}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* WHOIS Tab */}
            <TabsContent value="whois" className="space-y-4">
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    WHOIS Information
                  </Label>
                  {whoisData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(whoisData)}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md min-h-[200px]">
                  {whoisData ? (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {whoisData}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {isLoading ? "Fetching WHOIS data..." : "WHOIS information will appear here after analysis"}
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 border border-yellow-600/30 bg-yellow-900/20 rounded-md">
                  <Server className="h-5 w-5 text-yellow-400 float-left mr-2" />
                  <p className="text-sm text-yellow-300">
                    Browser Limitation: Real WHOIS queries cannot be performed directly in the browser.
                    Consider using one of the recommended external services mentioned above.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            {/* Port Scan Tab */}
            <TabsContent value="portscan" className="space-y-4">
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Common Ports
                  </Label>
                  {portResults.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(JSON.stringify(portResults, null, 2))}
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                  )}
                </div>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md min-h-[200px]">
                  {portResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-cyber-dark">
                            <th className="text-left py-2 px-3 text-gray-400">Port</th>
                            <th className="text-left py-2 px-3 text-gray-400">Service</th>
                            <th className="text-left py-2 px-3 text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portResults.map((port, index) => (
                            <tr key={index} className="border-b border-cyber-dark/30">
                              <td className="py-2 px-3 font-mono">{port.port}</td>
                              <td className="py-2 px-3">{port.service}</td>
                              <td className="py-2 px-3">
                                <span className="text-yellow-400">{port.state}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      {isLoading ? "Checking ports..." : "Port information will appear here after analysis"}
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 border border-yellow-600/30 bg-yellow-900/20 rounded-md">
                  <Server className="h-5 w-5 text-yellow-400 float-left mr-2" />
                  <p className="text-sm text-yellow-300">
                    Browser Limitation: Real port scanning cannot be performed in the browser due to security restrictions.
                    For actual port scanning, use dedicated tools like Nmap or online port scanning services.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReconTool;
