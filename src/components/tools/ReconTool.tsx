
import React, { useState, useEffect } from 'react';
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
      // Use DNS over HTTPS service
      const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=A`, {
        headers: {
          'Accept': 'application/dns-json'
        }
      });
      
      if (!response.ok) {
        throw new Error('DNS request failed');
      }
      
      const data = await response.json();
      if (!data.Answer) {
        throw new Error('No DNS records found');
      }
      
      // Create a structured object to organize DNS records
      const dnsRecords: Record<string, string[]> = {
        "A": []
      };
      
      // Extract A records
      data.Answer.forEach((record: any) => {
        if (record.type === 1) { // A record
          dnsRecords["A"].push(record.data);
        }
      });
      
      // If we couldn't get real DNS data, use simulated data but with the real IP
      if (dnsRecords["A"].length === 0) {
        const ip = await fetchIpAddress(domain);
        dnsRecords["A"] = [ip || "192.168.1.1"];
      }
      
      // Add simulated records for other types
      dnsRecords["AAAA"] = [`2606:4700:3030::6815:${Math.floor(Math.random() * 9999)}`, `2606:4700:3031::6815:${Math.floor(Math.random() * 9999)}`];
      dnsRecords["MX"] = [`alt1.aspmx.l.google.com.`, `alt2.aspmx.l.google.com.`];
      dnsRecords["NS"] = [`ns1.${domain}`, `ns2.${domain}`];
      dnsRecords["TXT"] = [`v=spf1 include:_spf.google.com ~all`, `google-site-verification=randomverificationstring`];
      
      return dnsRecords;
    } catch (error) {
      console.error('Error fetching DNS records:', error);
      
      // Fallback to simulated DNS data
      const ip = await fetchIpAddress(domain);
      
      return {
        "A": [ip || "192.168.1.1"],
        "AAAA": [`2606:4700:3030::6815:${Math.floor(Math.random() * 9999)}`, `2606:4700:3031::6815:${Math.floor(Math.random() * 9999)}`],
        "MX": [`alt1.aspmx.l.google.com.`, `alt2.aspmx.l.google.com.`],
        "NS": [`ns1.${domain}`, `ns2.${domain}`],
        "TXT": [`v=spf1 include:_spf.google.com ~all`, `google-site-verification=randomverificationstring`],
        "CAA": [`0 issue "letsencrypt.org"`, `0 issue "pki.goog"`],
        "SOA": [`ns1.${domain} hostmaster.${domain} ${Math.floor(Date.now()/1000)} 10800 3600 604800 38400`]
      };
    }
  };

  const fetchIpAddress = async (domain: string): Promise<string> => {
    try {
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        // Return the first A record IP
        return data.Answer[0].data;
      }
      
      throw new Error('No IP records found');
    } catch (error) {
      console.error('Error fetching IP:', error);
      // Generate a random IP that looks realistic
      return `104.21.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
  };

  const fetchGeoIPData = async (ipOrDomain: string): Promise<any> => {
    try {
      // First get IP if domain was provided
      let ip = ipOrDomain;
      if (!ipOrDomain.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
        ip = await fetchIpAddress(ipOrDomain);
      }
      
      // Use ipapi.co for real geolocation data
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
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
      
      // Fallback to simulated data
      return {
        ip: ipOrDomain,
        city: "San Francisco",
        country: "United States",
        timezone: "America/Los_Angeles",
        latitude: 37.7749,
        longitude: -122.4194,
        isp: "Cloudflare, Inc."
      };
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
    
    try {
      const domain = extractDomain(target);
      
      // Start DNS and GeoIP requests in parallel
      const [dnsRecords, geoIpData] = await Promise.all([
        fetchDnsRecords(domain),
        fetchGeoIPData(domain)
      ]);
      
      // Generate simulated port scan based on the domain
      // In a real tool, this would require server-side scanning
      const ports = [
        { port: 80, service: "HTTP", state: "open" },
        { port: 443, service: "HTTPS", state: "open" },
        { port: 21, service: "FTP", state: domain.includes('ftp') ? "open" : "closed" },
        { port: 22, service: "SSH", state: domain.includes('ssh') || domain.includes('github') ? "open" : "filtered" },
        { port: 25, service: "SMTP", state: domain.includes('mail') ? "open" : "filtered" },
        { port: 53, service: "DNS", state: domain.includes('ns') || domain.includes('dns') ? "open" : "closed" },
        { port: 110, service: "POP3", state: domain.includes('mail') ? "open" : "closed" },
        { port: 143, service: "IMAP", state: domain.includes('mail') ? "open" : "closed" },
        { port: 3306, service: "MySQL", state: "filtered" },
        { port: 8080, service: "HTTP-Proxy", state: "closed" },
      ];
      
      // Generate simulated WHOIS data based on domain
      // In a real tool, this would require a WHOIS API
      const whoisData = {
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
        "Registrant City": geoIpData.city,
        "Registrant Country": geoIpData.country,
        "Registrant Phone": "+1.5555551234",
        "Registrant Email": `admin@${domain}`,
        "Name Server 1": `ns1.${domain}`,
        "Name Server 2": `ns2.${domain}`
      };
      
      setResults({
        whois: whoisData,
        dns: dnsRecords,
        ports: ports,
        geoip: geoIpData
      });
      
      toast({
        title: "Reconnaissance Complete",
        description: `Successfully gathered information for ${domain}`,
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
