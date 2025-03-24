
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Globe, Server, Activity, RotateCcw, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type DnsRecord = {
  type: string;
  value: string;
  ttl?: number;
};

type GeoIpInfo = {
  ip: string;
  country?: string;
  city?: string;
  region?: string;
  loc?: string;
  org?: string;
  timezone?: string;
};

type WhoisInfo = {
  domain: string;
  registrar?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  status?: string[];
  nameservers?: string[];
};

type PortInfo = {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
};

const ReconTool: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [tab, setTab] = useState('dns');
  const [isLoading, setIsLoading] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [geoIpInfo, setGeoIpInfo] = useState<GeoIpInfo | null>(null);
  const [whoisInfo, setWhoisInfo] = useState<WhoisInfo | null>(null);
  const [portInfo, setPortInfo] = useState<PortInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const normalizeDomain = (input: string): string => {
    // Remove protocol and path components
    let normalized = input.trim();
    normalized = normalized.replace(/^(https?:\/\/)?(www\.)?/i, '');
    normalized = normalized.split('/')[0]; // Remove any path
    return normalized;
  };

  const validateDomain = (input: string): boolean => {
    // Basic domain validation (allows subdomains)
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(input);
  };

  const handleSearch = async () => {
    const normalizedDomain = normalizeDomain(domain);
    
    if (!validateDomain(normalizedDomain)) {
      toast({
        title: "Invalid Domain",
        description: "Please enter a valid domain name (e.g., example.com)",
        variant: "destructive",
      });
      setError("Invalid domain format. Please enter a valid domain name (e.g., example.com)");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Clear previous results based on active tab
    if (tab === 'dns') setDnsRecords([]);
    else if (tab === 'geoip') setGeoIpInfo(null);
    else if (tab === 'whois') setWhoisInfo(null);
    else if (tab === 'portscan') setPortInfo([]);

    try {
      if (tab === 'dns') {
        await fetchDnsInfo(normalizedDomain);
      } else if (tab === 'geoip') {
        await fetchGeoIpInfo(normalizedDomain);
      } else if (tab === 'whois') {
        await fetchWhoisInfo(normalizedDomain);
      } else if (tab === 'portscan') {
        await simulatePortScan(normalizedDomain);
      }
    } catch (err) {
      console.error("Error during reconnaissance:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Error: ${errorMessage}`);
      toast({
        title: "Lookup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDnsInfo = async (domain: string) => {
    try {
      // Try primary DNS API
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        const records: DnsRecord[] = data.Answer.map((record: any) => ({
          type: record.type === 1 ? 'A' : record.type === 28 ? 'AAAA' : record.type === 5 ? 'CNAME' : record.type === 2 ? 'NS' : record.type === 15 ? 'MX' : `TYPE${record.type}`,
          value: record.data,
          ttl: record.TTL,
        }));
        
        // Also fetch MX and NS records
        try {
          const mxResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
          const mxData = await mxResponse.json();
          if (mxData.Answer && mxData.Answer.length > 0) {
            const mxRecords: DnsRecord[] = mxData.Answer.map((record: any) => ({
              type: 'MX',
              value: record.data,
              ttl: record.TTL,
            }));
            records.push(...mxRecords);
          }
        } catch (e) {
          console.warn("Failed to fetch MX records:", e);
        }
        
        try {
          const nsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`);
          const nsData = await nsResponse.json();
          if (nsData.Answer && nsData.Answer.length > 0) {
            const nsRecords: DnsRecord[] = nsData.Answer.map((record: any) => ({
              type: 'NS',
              value: record.data,
              ttl: record.TTL,
            }));
            records.push(...nsRecords);
          }
        } catch (e) {
          console.warn("Failed to fetch NS records:", e);
        }
        
        setDnsRecords(records);
        return;
      }
      
      throw new Error("No DNS records found or API error");
    } catch (error) {
      console.warn("Primary DNS API failed, trying fallback:", error);
      
      // Fallback to alternative API
      try {
        const fallbackResponse = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, {
          headers: {
            'X-Api-Key': 'YOUR_API_NINJAS_KEY', // Note: In a real implementation, this should be properly secured
          },
        });
        
        // Basic public DNS lookup without API key
        const response = await fetch(`https://networkcalc.com/api/dns/lookup/${domain}`);
        const data = await response.json();
        
        if (data && data.status === "OK" && data.records) {
          const records: DnsRecord[] = [];
          
          // Process A records
          if (data.records.A) {
            data.records.A.forEach((record: any) => {
              records.push({
                type: 'A',
                value: record.address,
                ttl: record.ttl,
              });
            });
          }
          
          // Process AAAA records
          if (data.records.AAAA) {
            data.records.AAAA.forEach((record: any) => {
              records.push({
                type: 'AAAA',
                value: record.address,
                ttl: record.ttl,
              });
            });
          }
          
          // Process CNAME records
          if (data.records.CNAME) {
            data.records.CNAME.forEach((record: any) => {
              records.push({
                type: 'CNAME',
                value: record.target,
                ttl: record.ttl,
              });
            });
          }
          
          // Process MX records
          if (data.records.MX) {
            data.records.MX.forEach((record: any) => {
              records.push({
                type: 'MX',
                value: `${record.priority} ${record.target}`,
                ttl: record.ttl,
              });
            });
          }
          
          // Process NS records
          if (data.records.NS) {
            data.records.NS.forEach((record: any) => {
              records.push({
                type: 'NS',
                value: record.target,
                ttl: record.ttl,
              });
            });
          }
          
          if (records.length > 0) {
            setDnsRecords(records);
            return;
          }
        }
        
        // Last resort fallback: Try to at least resolve the IP address
        try {
          const ipResponse = await fetch(`https://api.ipify.org?format=json`);
          const ipData = await ipResponse.json();
          
          setDnsRecords([
            {
              type: 'A',
              value: `Lookup limited in browser. Use a dedicated DNS tool for complete results.`,
            }
          ]);
        } catch (e) {
          throw new Error("All DNS lookup methods failed. Try a different domain or use a dedicated tool.");
        }
      } catch (fallbackError) {
        console.error("All DNS lookup attempts failed:", fallbackError);
        throw new Error("Failed to retrieve DNS records. Try a different domain or use a dedicated tool.");
      }
    }
  };

  const fetchGeoIpInfo = async (domain: string) => {
    try {
      // First, try to resolve the domain to an IP if it's not already an IP
      let ip = domain;
      if (!domain.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        try {
          // Try to resolve domain to IP first
          const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
          const dnsData = await dnsResponse.json();
          
          if (dnsData.Answer && dnsData.Answer.length > 0) {
            const aRecord = dnsData.Answer.find((record: any) => record.type === 1); // Type 1 is A record
            if (aRecord) {
              ip = aRecord.data;
            }
          } else {
            throw new Error("Could not resolve domain to IP address");
          }
        } catch (e) {
          console.warn("DNS resolution failed:", e);
          // Try alternative method to get IP
          try {
            const altDnsResponse = await fetch(`https://networkcalc.com/api/dns/lookup/${domain}`);
            const altDnsData = await altDnsResponse.json();
            
            if (altDnsData && altDnsData.status === "OK" && altDnsData.records && altDnsData.records.A && altDnsData.records.A.length > 0) {
              ip = altDnsData.records.A[0].address;
            } else {
              throw new Error("Could not resolve domain to IP address");
            }
          } catch (altError) {
            throw new Error("Could not resolve domain to IP address. Try entering an IP directly.");
          }
        }
      }
      
      // Now that we have an IP (or the original domain was an IP), fetch GeoIP info
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();
      
      if (data && !data.error) {
        setGeoIpInfo({
          ip: data.ip,
          country: data.country,
          city: data.city,
          region: data.region,
          loc: data.loc,
          org: data.org,
          timezone: data.timezone,
        });
      } else {
        // Fallback to alternative API
        try {
          const fallbackResponse = await fetch(`https://ipapi.co/${ip}/json/`);
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData && !fallbackData.error) {
            setGeoIpInfo({
              ip: fallbackData.ip,
              country: fallbackData.country_name,
              city: fallbackData.city,
              region: fallbackData.region,
              loc: `${fallbackData.latitude},${fallbackData.longitude}`,
              org: fallbackData.org || fallbackData.asn,
              timezone: fallbackData.timezone,
            });
          } else {
            throw new Error("Could not retrieve geolocation information for this IP");
          }
        } catch (fallbackError) {
          throw new Error("All GeoIP lookups failed. Try a different domain or IP.");
        }
      }
    } catch (error) {
      console.error("GeoIP lookup failed:", error);
      throw error;
    }
  };

  const fetchWhoisInfo = async (domain: string) => {
    // WHOIS is difficult to implement in the browser due to CORS restrictions
    // and the lack of official APIs. In a real implementation, this would require a server-side component.
    try {
      // Simulate a WHOIS lookup with limited browser capabilities
      setWhoisInfo({
        domain: domain,
        registrar: "Browser-based WHOIS lookups are limited due to CORS restrictions",
        nameservers: ["Use a dedicated WHOIS tool or command line utility for complete information"]
      });
      
      // We'll show a message to the user about the limitation
      setError("Browser-based WHOIS lookups are limited due to CORS restrictions. For complete WHOIS information, use a dedicated tool or command line utility.");
    } catch (error) {
      console.error("WHOIS lookup failed:", error);
      throw new Error("WHOIS lookup failed. Browser-based WHOIS queries are limited due to CORS restrictions.");
    }
  };

  const simulatePortScan = async (domain: string) => {
    // Port scanning from a browser is impossible due to security restrictions
    // This is a simulation to show what the feature would do in a real security tool
    try {
      setPortInfo([
        {
          port: 80,
          service: "HTTP",
          status: "open",
        },
        {
          port: 443,
          service: "HTTPS",
          status: "open",
        }
      ]);
      
      // Explain the limitation to the user
      setError("Browser-based port scanning is not possible due to security restrictions. This is a simulated result showing common web ports. For actual port scanning, use a dedicated network tool like Nmap.");
    } catch (error) {
      console.error("Port scan simulation failed:", error);
      throw new Error("Port scanning from a browser is not possible due to security restrictions.");
    }
  };

  const handleReset = () => {
    setDomain('');
    setDnsRecords([]);
    setGeoIpInfo(null);
    setWhoisInfo(null);
    setPortInfo([]);
    setError(null);
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Search className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Reconnaissance</h2>
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
              Domain or IP Address
            </Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name or IP (e.g., example.com)"
                className="font-mono flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full" />
                ) : (
                  <>
                    <Search className="mr-1 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-4">
              <TabsTrigger value="dns" className="text-xs md:text-sm">
                <Globe className="h-3 w-3 mr-1" />
                DNS
              </TabsTrigger>
              <TabsTrigger value="geoip" className="text-xs md:text-sm">
                <Globe className="h-3 w-3 mr-1" />
                GeoIP
              </TabsTrigger>
              <TabsTrigger value="whois" className="text-xs md:text-sm">
                <Server className="h-3 w-3 mr-1" />
                WHOIS
              </TabsTrigger>
              <TabsTrigger value="portscan" className="text-xs md:text-sm">
                <Activity className="h-3 w-3 mr-1" />
                Port Scan
              </TabsTrigger>
            </TabsList>

            {/* Error display */}
            {error && (
              <Alert variant="destructive" className="mb-4 bg-amber-950 border-amber-800 text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* DNS Lookup */}
            <TabsContent value="dns" className="mt-0">
              <div className="bg-cyber-darker p-4 rounded-md min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="animate-spin h-8 w-8 border-2 border-cyber-blue border-opacity-50 border-t-cyber-blue rounded-full mb-4" />
                    <p className="text-cyber-blue">Looking up DNS records...</p>
                  </div>
                ) : dnsRecords.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-cyber-blue">DNS Records for {domain}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">Type</th>
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">Value</th>
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">TTL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dnsRecords.map((record, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="py-2 px-2 font-mono text-cyber-green">{record.type}</td>
                              <td className="py-2 px-2 font-mono break-all">{record.value}</td>
                              <td className="py-2 px-2 font-mono text-gray-400">{record.ttl || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Globe className="h-12 w-12 mb-4 opacity-20" />
                    <p>Enter a domain and click Search to look up DNS records</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* GeoIP Lookup */}
            <TabsContent value="geoip" className="mt-0">
              <div className="bg-cyber-darker p-4 rounded-md min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="animate-spin h-8 w-8 border-2 border-cyber-blue border-opacity-50 border-t-cyber-blue rounded-full mb-4" />
                    <p className="text-cyber-blue">Looking up geolocation data...</p>
                  </div>
                ) : geoIpInfo ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-cyber-blue">Geolocation for {domain}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">IP Address</p>
                        <p className="font-mono">{geoIpInfo.ip}</p>
                      </div>
                      
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">Country</p>
                        <p className="font-mono">{geoIpInfo.country || 'Unknown'}</p>
                      </div>
                      
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">City / Region</p>
                        <p className="font-mono">{(geoIpInfo.city && geoIpInfo.region) 
                          ? `${geoIpInfo.city}, ${geoIpInfo.region}` 
                          : (geoIpInfo.city || geoIpInfo.region || 'Unknown')}</p>
                      </div>
                      
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">Coordinates</p>
                        <p className="font-mono">{geoIpInfo.loc || 'Unknown'}</p>
                      </div>
                      
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">Organization</p>
                        <p className="font-mono">{geoIpInfo.org || 'Unknown'}</p>
                      </div>
                      
                      <div className="bg-cyber-dark/50 p-3 rounded">
                        <p className="text-gray-400 text-sm">Timezone</p>
                        <p className="font-mono">{geoIpInfo.timezone || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    {geoIpInfo.loc && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${geoIpInfo.loc}`, '_blank');
                        }}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Globe className="h-12 w-12 mb-4 opacity-20" />
                    <p>Enter a domain or IP and click Search to lookup geolocation</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* WHOIS Lookup */}
            <TabsContent value="whois" className="mt-0">
              <div className="bg-cyber-darker p-4 rounded-md min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="animate-spin h-8 w-8 border-2 border-cyber-blue border-opacity-50 border-t-cyber-blue rounded-full mb-4" />
                    <p className="text-cyber-blue">Looking up WHOIS data...</p>
                  </div>
                ) : whoisInfo ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-cyber-blue">WHOIS for {domain}</h3>
                    <Alert variant="default" className="bg-blue-950 border-blue-800 text-blue-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Full WHOIS lookup requires server-side processing due to browser security restrictions.
                        For detailed WHOIS data, use the whois command in a terminal or a dedicated WHOIS service.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-cyber-dark/50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                      <p>Domain: {whoisInfo.domain}</p>
                      {whoisInfo.registrar && <p>Registrar: {whoisInfo.registrar}</p>}
                      {whoisInfo.createdDate && <p>Created: {whoisInfo.createdDate}</p>}
                      {whoisInfo.updatedDate && <p>Updated: {whoisInfo.updatedDate}</p>}
                      {whoisInfo.expiresDate && <p>Expires: {whoisInfo.expiresDate}</p>}
                      
                      {whoisInfo.nameservers && whoisInfo.nameservers.length > 0 && (
                        <>
                          <p className="mt-2">Nameservers:</p>
                          <ul className="list-disc pl-5">
                            {whoisInfo.nameservers.map((ns, index) => (
                              <li key={index}>{ns}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      {whoisInfo.status && whoisInfo.status.length > 0 && (
                        <>
                          <p className="mt-2">Status:</p>
                          <ul className="list-disc pl-5">
                            {whoisInfo.status.map((status, index) => (
                              <li key={index}>{status}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                        window.open(`https://www.whois.com/whois/${domain}`, '_blank');
                      }}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View on WHOIS.com
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Server className="h-12 w-12 mb-4 opacity-20" />
                    <p>Enter a domain and click Search to look up WHOIS information</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Port Scan */}
            <TabsContent value="portscan" className="mt-0">
              <div className="bg-cyber-darker p-4 rounded-md min-h-[300px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <div className="animate-spin h-8 w-8 border-2 border-cyber-blue border-opacity-50 border-t-cyber-blue rounded-full mb-4" />
                    <p className="text-cyber-blue">Scanning ports...</p>
                  </div>
                ) : portInfo.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-cyber-blue">Port Scan for {domain}</h3>
                    <Alert variant="default" className="bg-blue-950 border-blue-800 text-blue-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Browser-based port scanning is not possible due to security restrictions.
                        Only common web ports are shown. Use Nmap or a similar tool for actual port scanning.
                      </AlertDescription>
                    </Alert>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">Port</th>
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">Service</th>
                            <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portInfo.map((info, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="py-2 px-2 font-mono">{info.port}</td>
                              <td className="py-2 px-2 font-mono">{info.service}</td>
                              <td className={`py-2 px-2 font-mono ${
                                info.status === 'open' ? 'text-green-400' : 
                                info.status === 'closed' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {info.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                        window.open(`https://www.shodan.io/host/${geoIpInfo?.ip || domain}`, '_blank');
                      }}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Check on Shodan
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                    <Activity className="h-12 w-12 mb-4 opacity-20" />
                    <p>Enter a domain and click Search to scan common ports</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReconTool;
