
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

  const fetchDnsRecords = async (domain: string) => {
    try {
      // Use multiple DNS over HTTPS services
      const dnsServices = [
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        `https://dns.google/resolve?name=${domain}&type=A`,
        `https://mozilla.cloudflare-dns.com/dns-query?name=${domain}&type=A`
      ];
      
      let dnsData = null;
      
      for (const service of dnsServices) {
        try {
          const response = await fetch(service, {
            headers: {
              'Accept': 'application/dns-json'
            }
          });
          
          if (response.ok) {
            dnsData = await response.json();
            if (dnsData?.Answer) break;
          }
        } catch (error) {
          console.error(`Error with DNS service ${service}:`, error);
          // Continue to next service
        }
      }
      
      if (!dnsData?.Answer) {
        throw new Error('No DNS records found');
      }
      
      // Create a structured object to organize DNS records
      const dnsRecords: Record<string, string[]> = {
        "A": []
      };
      
      // Extract A records
      dnsData.Answer.forEach((record: any) => {
        if (record.type === 1) { // A record
          dnsRecords["A"].push(record.data);
        }
      });
      
      // Get more DNS record types
      const recordTypes = ['AAAA', 'MX', 'NS', 'TXT', 'CAA', 'SOA'];
      
      await Promise.all(recordTypes.map(async (type) => {
        try {
          const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`, {
            headers: {
              'Accept': 'application/dns-json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
              dnsRecords[type] = data.Answer.map((record: any) => record.data);
            }
          }
        } catch (error) {
          console.error(`Error fetching ${type} records:`, error);
          // If we can't get this record type, we just won't include it
        }
      }));
      
      return dnsRecords;
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      throw error;
    }
  };

  const fetchIpAddress = async (domain: string): Promise<string> => {
    try {
      // Try multiple DNS services
      const dnsServices = [
        `https://dns.google/resolve?name=${domain}&type=A`,
        `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
        `https://mozilla.cloudflare-dns.com/dns-query?name=${domain}&type=A`
      ];
      
      for (const service of dnsServices) {
        try {
          const response = await fetch(service, {
            headers: {
              'Accept': 'application/dns-json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
              // Return the first A record IP
              return data.Answer[0].data;
            }
          }
        } catch (error) {
          console.error(`Error with IP lookup service ${service}:`, error);
          // Continue to next service
        }
      }
      
      throw new Error('No IP records found');
    } catch (error) {
      console.error('Error fetching IP:', error);
      throw error;
    }
  };

  const fetchGeoIPData = async (ipOrDomain: string) => {
    try {
      // First get IP if domain was provided
      let ip = ipOrDomain;
      if (!ipOrDomain.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
        ip = await fetchIpAddress(ipOrDomain);
      }
      
      // Use ipapi.co for real geolocation data
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch geo data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Failed to fetch geo data');
      }
      
      return {
        ip: ip,
        city: data.city || 'Unknown',
        country: data.country_name || 'Unknown',
        timezone: data.timezone || 'Unknown',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        isp: data.org || 'Unknown'
      };
    } catch (error) {
      console.error('Error fetching GeoIP data:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    setResults({
      whois: null,
      dns: null,
      ports: null,
      geoip: null
    });
    
    try {
      const domain = extractDomain(target);
      let dnsRecords = null;
      let geoIpData = null;
      
      // Fetch real DNS and GeoIP data
      try {
        [dnsRecords, geoIpData] = await Promise.all([
          fetchDnsRecords(domain).catch(error => {
            console.error('DNS fetch error:', error);
            toast({
              title: "DNS Lookup Failed",
              description: "Could not retrieve DNS records. CORS restrictions may be preventing access.",
              variant: "destructive",
            });
            return null;
          }),
          fetchGeoIPData(domain).catch(error => {
            console.error('GeoIP fetch error:', error);
            toast({
              title: "GeoIP Lookup Failed",
              description: "Could not retrieve geolocation data for this domain.",
              variant: "destructive",
            });
            return null;
          })
        ]);
      } catch (error) {
        console.error('Error in parallel fetches:', error);
      }
      
      // For WHOIS, we can't do this client-side due to CORS, so we explain this limitation
      const whoisLimitation = {
        "Information": "WHOIS data cannot be retrieved directly from the browser due to CORS restrictions.",
        "Alternative": "Use a command-line tool like 'whois' or a service like whois.com to get this information.",
        "Domain": domain,
        "Note": "Most modern browsers prevent cross-origin requests to WHOIS servers for security reasons.",
        "Recommendation": "For real WHOIS data, use a server-side API or dedicated WHOIS lookup service."
      };
      
      // Port scanning can't be done from the browser, so explain this
      const portScanningLimitation = [
        { 
          port: 0, 
          service: "Information", 
          state: "info",
          notes: "Browser security restrictions prevent real port scanning from client-side JavaScript."
        },
        { 
          port: 0, 
          service: "Alternative", 
          state: "info",
          notes: "For security testing, use dedicated tools like Nmap from your local machine."
        },
        { 
          port: 0, 
          service: "Common Ports", 
          state: "info",
          notes: "Port 80 (HTTP), 443 (HTTPS), 21 (FTP), 22 (SSH), 25 (SMTP), 53 (DNS), etc."
        },
        { 
          port: 0, 
          service: "Legal Notice", 
          state: "warning",
          notes: "Port scanning without permission may be illegal in some jurisdictions."
        }
      ];
      
      setResults({
        whois: whoisLimitation,
        dns: dnsRecords,
        ports: portScanningLimitation,
        geoip: geoIpData
      });
      
      toast({
        title: "Reconnaissance Complete",
        description: `Successfully gathered available information for ${domain}`,
      });
    } catch (error) {
      console.error('Error during reconnaissance:', error);
      toast({
        title: "Scan Failed",
        description: "An error occurred while gathering information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            Note: Some data may be limited due to browser security restrictions.
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
              
              <div className="p-3 border border-yellow-500/30 bg-yellow-900/20 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium text-yellow-400 mb-1">Browser Limitations</p>
                    <p>WHOIS data cannot be accessed directly from browsers due to CORS security restrictions. For authentic WHOIS data, use command-line tools or WHOIS lookup websites.</p>
                  </div>
                </div>
              </div>
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
              
              {results.dns ? (
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
              ) : (
                <div className="bg-cyber-darker border border-cyber-dark rounded-md p-6 text-center">
                  <p className="text-gray-400">No DNS records could be retrieved. This may be due to CORS restrictions or because the domain doesn't exist.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Port Scan Information</h3>
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Information</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-dark">
                      {results.ports.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.service}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.state === 'info' ? 'bg-blue-900/30 text-blue-400' :
                              item.state === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-gray-900/30 text-gray-400'
                            }`}>
                              {item.notes}
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
                    <p className="font-medium text-blue-400 mb-1">Browser Limitations</p>
                    <p>Due to security restrictions, browsers cannot perform real port scans. For actual port scanning, use dedicated tools like Nmap from your local machine. Remember that unauthorized port scanning may be illegal in some jurisdictions.</p>
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
              
              {results.geoip ? (
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
              ) : (
                <div className="bg-cyber-darker border border-cyber-dark rounded-md p-6 text-center">
                  <p className="text-gray-400">Could not retrieve geolocation data for this target. This may be due to API limitations or because the IP/domain couldn't be resolved.</p>
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
