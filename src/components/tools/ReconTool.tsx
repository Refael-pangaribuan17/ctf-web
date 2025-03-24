
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, RotateCcw, Copy, Server } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Utility to validate domain/URL format with more flexible approach
const isValidDomain = (input: string) => {
  // Clean input by removing protocols and paths
  let domain = input.trim();
  
  // Remove protocol if exists
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = domain.split('//')[1];
  }
  
  // Remove path and query params if exist
  if (domain.includes('/')) {
    domain = domain.split('/')[0];
  }
  
  // Basic domain pattern
  // Allow subdomains, second-level domains, and top-level domains like .com, .net, .org, etc.
  // Also allow IP addresses
  const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;
  
  return domainPattern.test(domain) || ipPattern.test(domain);
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const normalizeDomain = (input: string): string => {
    let normalized = input.trim();
    
    // Remove protocol if exists
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      normalized = normalized.split('//')[1];
    }
    
    // Remove path and query params if exist
    if (normalized.includes('/')) {
      normalized = normalized.split('/')[0];
    }
    
    return normalized;
  };

  const fetchDNSRecords = async (domain: string): Promise<DNSRecord[]> => {
    const normalizedDomain = normalizeDomain(domain);
    console.log(`Attempting to fetch DNS records for: ${normalizedDomain}`);
    
    // Use a public API service that supports CORS
    try {
      const response = await fetch(`https://dns.google/resolve?name=${normalizedDomain}&type=A`, {
        headers: {
          'Accept': 'application/dns-json',
        }
      });
      
      if (!response.ok) {
        console.log(`Google DNS API response not OK: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Google DNS API response:", data);
      
      if (!data.Answer || data.Answer.length === 0) {
        // Try ipinfo.io as fallback for A records
        console.log("No DNS records found, trying ipinfo.io...");
        const ipinfoResponse = await fetch(`https://ipinfo.io/${normalizedDomain}/json`);
        if (ipinfoResponse.ok) {
          const ipData = await ipinfoResponse.json();
          console.log("ipinfo.io response:", ipData);
          if (ipData.ip) {
            return [{
              type: 'A',
              name: normalizedDomain,
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
      console.error("Primary DNS resolution failed:", error);
      
      // Try alternative DNS resolver
      try {
        console.log("Trying alternative: ipapi.co...");
        // Try with ipapi.co which supports CORS
        const ipapiResponse = await fetch(`https://ipapi.co/${normalizedDomain}/json/`);
        if (ipapiResponse.ok) {
          const ipData = await ipapiResponse.json();
          console.log("ipapi.co response:", ipData);
          if (ipData.ip && !ipData.error) {
            return [{
              type: 'A',
              name: normalizedDomain,
              value: ipData.ip,
              ttl: 300
            }];
          }
        }
        
        // Try cloudflare DNS over HTTPS
        console.log("Trying Cloudflare DNS...");
        const cloudflareResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${normalizedDomain}&type=A`, {
          headers: {
            'Accept': 'application/dns-json'
          }
        });
        
        if (cloudflareResponse.ok) {
          const cloudflareData = await cloudflareResponse.json();
          console.log("Cloudflare DNS response:", cloudflareData);
          
          if (cloudflareData.Answer && cloudflareData.Answer.length > 0) {
            return cloudflareData.Answer.map((record: any) => ({
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
          }
        }
        
        // Try another approach - fetch from public APIs
        console.log("Trying public-apis.io...");
        const publicApisResponse = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${normalizedDomain}`, {
          headers: {
            'X-Api-Key': 'YOUR_API_KEY'
          }
        });
        
        if (publicApisResponse.ok) {
          const dnsData = await publicApisResponse.json();
          console.log("API Ninjas response:", dnsData);
          
          if (Array.isArray(dnsData) && dnsData.length > 0) {
            return dnsData
              .filter((record: any) => record && record.record_type && record.value)
              .map((record: any) => ({
                type: record.record_type,
                name: normalizedDomain,
                value: record.value,
                ttl: record.ttl || 300
              }));
          }
        }
      } catch (fallbackError) {
        console.error("Fallback DNS resolution failed:", fallbackError);
      }
      
      // Final fallback - use ipinfo.io with the domain directly
      try {
        console.log("Final fallback with ipinfo.io...");
        const response = await fetch(`https://ipinfo.io/${encodeURIComponent(normalizedDomain)}/json`);
        if (response.ok) {
          const data = await response.json();
          console.log("Final ipinfo.io response:", data);
          if (data.ip) {
            return [{
              type: 'A',
              name: normalizedDomain,
              value: data.ip,
              ttl: 300
            }];
          }
        }
      } catch (err) {
        console.error("All DNS resolution attempts failed");
      }
      
      throw new Error('Unable to fetch DNS records. This could be due to CORS restrictions or the domain not existing.');
    }
  };

  const fetchGeoIPData = async (domain: string): Promise<GeoIPData> => {
    const normalizedDomain = normalizeDomain(domain);
    console.log(`Attempting to fetch GeoIP data for: ${normalizedDomain}`);
    
    // First try to get IP from our DNS records
    let ip = '';
    const dnsRecord = dnsRecords.find(record => record.type === 'A');
    if (dnsRecord) {
      ip = dnsRecord.value;
      console.log(`Using IP from DNS records: ${ip}`);
    } else {
      // Try to resolve it directly
      try {
        console.log("Trying to resolve IP directly from ipinfo.io...");
        const ipinfoResponse = await fetch(`https://ipinfo.io/${normalizedDomain}/json`);
        if (ipinfoResponse.ok) {
          const ipData = await ipinfoResponse.json();
          console.log("ipinfo.io direct response:", ipData);
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
        console.log("Trying to resolve IP from ipapi.co...");
        const ipapiResponse = await fetch(`https://ipapi.co/${normalizedDomain}/json/`);
        if (ipapiResponse.ok) {
          const ipData = await ipapiResponse.json();
          console.log("ipapi.co direct response:", ipData);
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
      console.log(`Fetching detailed GeoIP data for IP: ${ip}`);
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("GeoIP data from ipinfo.io:", data);
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
      console.error("Primary GeoIP lookup failed:", error);
      
      // Fallback to ipapi.co
      try {
        console.log("Trying fallback GeoIP with ipapi.co...");
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("GeoIP data from ipapi.co:", data);
        
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

  const generateWHOISLookup = async (domain: string): Promise<string> => {
    const normalizedDomain = normalizeDomain(domain);
    
    // WHOIS lookups cannot be done client-side due to CORS, so we'll explain this
    return `
Domain Name: ${normalizedDomain.toUpperCase()}

NOTE: Real WHOIS lookups cannot be performed directly in the browser due to CORS limitations.

To perform an actual WHOIS lookup, you can:
1. Use a command-line tool like 'whois' on Linux/Mac or online WHOIS services
2. Visit https://whois.domaintools.com/${normalizedDomain} 
3. Visit https://www.whois.com/whois/${normalizedDomain}

A WHOIS query provides domain registration information including:
- Registrar information
- Domain creation and expiration dates
- Name servers
- Registrant contact information (if not private)
- Administrative and technical contacts
`;
  };

  const generatePortScanInfo = (domain: string): PortData[] => {
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
    
    const normalizedDomain = normalizeDomain(domain);
    console.log(`Normalized domain: ${normalizedDomain}`);
    
    // Less strict domain validation
    if (!normalizedDomain.includes('.')) {
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
    setError(null);
    
    try {
      // Process the selected tab
      if (activeTab === 'dns' || activeTab === 'geoip') {
        // DNS lookups are needed for both DNS and GeoIP tabs
        const records = await fetchDNSRecords(normalizedDomain);
        setDnsRecords(records);
        
        if (activeTab === 'geoip') {
          try {
            const geoData = await fetchGeoIPData(normalizedDomain);
            setGeoIPData(geoData);
          } catch (geoError) {
            console.error("GeoIP fetch error:", geoError);
            setError(geoError instanceof Error ? geoError.message : "Failed to retrieve geolocation data.");
            toast({
              title: "GeoIP Lookup Failed",
              description: geoError instanceof Error ? geoError.message : "Failed to retrieve geolocation data.",
              variant: "destructive",
            });
          }
        }
      } else if (activeTab === 'whois') {
        const whoisInfo = await generateWHOISLookup(normalizedDomain);
        setWhoisData(whoisInfo);
      } else if (activeTab === 'portscan') {
        const portInfo = generatePortScanInfo(normalizedDomain);
        setPortResults(portInfo);
      }
      
      toast({
        title: "Analysis Complete",
        description: `Reconnaissance data retrieved for ${normalizedDomain}`,
      });
    } catch (error) {
      console.error("Recon error:", error);
      setError(error instanceof Error ? error.message : "Failed to retrieve reconnaissance data.");
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
    setError(null);
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
              Enter a domain name to perform reconnaissance (e.g., example.com, google.com)
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 rounded-md p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
