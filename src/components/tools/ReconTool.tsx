
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Search, RotateCcw, ExternalLink, Download, Globe, Copy, AlertTriangle } from 'lucide-react';

const ReconTool: React.FC = () => {
  const [domain, setDomain] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [dnsResults, setDnsResults] = useState<string | null>(null);
  const [whoisResults, setWhoisResults] = useState<string | null>(null);
  const [portScanResults, setPortScanResults] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'domain' | 'ip'>('domain');
  const [portRanges, setPortRanges] = useState({
    common: true,
    http: true,
    mail: true,
    database: true,
    custom: false
  });
  const [customPorts, setCustomPorts] = useState('');
  const { toast } = useToast();

  const handleReset = () => {
    setDomain('');
    setIpAddress('');
    setDnsResults(null);
    setWhoisResults(null);
    setPortScanResults(null);
    setPortRanges({
      common: true,
      http: true,
      mail: true,
      database: true,
      custom: false
    });
    setCustomPorts('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content copied to clipboard",
    });
  };

  const handleSaveResults = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const simulateDnsScan = () => {
    const target = targetType === 'domain' ? domain : ipAddress;
    
    if (!target) {
      toast({
        title: "Target required",
        description: `Please enter a ${targetType === 'domain' ? 'domain' : 'IP address'}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsScanning(true);
    setDnsResults(null);
    
    setTimeout(() => {
      let results = '';
      
      if (targetType === 'domain') {
        // Generate fake DNS records for the domain
        results = `# DNS Records for ${domain}

;; QUESTION SECTION:
;${domain}.			IN	ANY

;; ANSWER SECTION:
${domain}.		3600	IN	A	203.0.113.${Math.floor(Math.random() * 255)}
${domain}.		3600	IN	MX	10 mail.${domain}.
${domain}.		3600	IN	NS	ns1.${domain}.
${domain}.		3600	IN	NS	ns2.${domain}.
${domain}.		3600	IN	TXT	"v=spf1 include:_spf.${domain} ~all"
${domain}.		3600	IN	SOA	ns1.${domain}. hostmaster.${domain}. 2023031301 10800 3600 604800 86400

;; ADDITIONAL SECTION:
mail.${domain}.	3600	IN	A	203.0.113.${Math.floor(Math.random() * 255)}
ns1.${domain}.		3600	IN	A	203.0.113.${Math.floor(Math.random() * 255)}
ns2.${domain}.		3600	IN	A	203.0.113.${Math.floor(Math.random() * 255)}
www.${domain}.		3600	IN	CNAME	${domain}.
blog.${domain}.	3600	IN	CNAME	${domain}.`;
      } else {
        // Generate fake reverse DNS for the IP
        const ipParts = ipAddress.split('.');
        const fakeDomain = `host-${ipParts.join('-')}.example.com`;
        
        results = `# Reverse DNS Lookup for ${ipAddress}

;; QUESTION SECTION:
;${ipAddress.split('.').reverse().join('.')}.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
${ipAddress.split('.').reverse().join('.')}.in-addr.arpa. 86400 IN PTR ${fakeDomain}.

;; AUTHORITY SECTION:
in-addr.arpa.		86400	IN	NS	a.in-addr-servers.arpa.
in-addr.arpa.		86400	IN	NS	b.in-addr-servers.arpa.`;
      }
      
      setDnsResults(results);
      setIsScanning(false);
      
      toast({
        title: "DNS lookup complete",
        description: `Found ${targetType === 'domain' ? '8' : '1'} DNS records`,
      });
    }, 1500);
  };

  const simulateWhoisLookup = () => {
    const target = targetType === 'domain' ? domain : ipAddress;
    
    if (!target) {
      toast({
        title: "Target required",
        description: `Please enter a ${targetType === 'domain' ? 'domain' : 'IP address'}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsScanning(true);
    setWhoisResults(null);
    
    setTimeout(() => {
      let results = '';
      
      if (targetType === 'domain') {
        // Generate fake WHOIS data for the domain
        const randomDate = new Date();
        randomDate.setFullYear(randomDate.getFullYear() - Math.floor(Math.random() * 10));
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 5) + 1);
        
        results = `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: ${Math.random().toString(36).substring(2, 15)}_DOMAIN
Registrar WHOIS Server: whois.example-registrar.com
Registrar URL: http://www.example-registrar.com
Updated Date: ${new Date().toISOString().split('T')[0]}
Creation Date: ${randomDate.toISOString().split('T')[0]}
Registry Expiry Date: ${expiryDate.toISOString().split('T')[0]}
Registrar: Example Registrar, Inc.
Registrar IANA ID: 1234567
Registrar Abuse Contact Email: abuse@example-registrar.com
Registrar Abuse Contact Phone: +1.5555555555
Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
Name Server: NS1.${domain}
Name Server: NS2.${domain}
DNSSEC: unsigned
URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/

>>> Last update of WHOIS database: ${new Date().toISOString().split('T')[0]} <<<`;
      } else {
        // Generate fake WHOIS data for the IP
        results = `% Information related to '${ipAddress}/24'

% Abuse contact for '${ipAddress}/24' is 'abuse@example.net'

inetnum:        ${ipAddress}/24
netname:        EXAMPLE-NET
descr:          Example ISP Network
country:        US
admin-c:        EX123-RIPE
tech-c:         EX123-RIPE
status:         ALLOCATED PA
mnt-by:         EXAMPLEISP-MNT
created:        2018-01-01T00:00:00Z
last-modified:  2023-01-01T00:00:00Z
source:         RIPE

organisation:   ORG-EISP1-RIPE
org-name:       Example ISP Inc.
org-type:       LIR
address:        123 Main Street
address:        Anytown, CA 12345
address:        United States
phone:          +1 555 123 4567
abuse-c:        EXAB-RIPE
mnt-ref:        EXAMPLEISP-MNT
mnt-by:         EXAMPLEISP-MNT
created:        2010-01-01T00:00:00Z
last-modified:  2022-01-01T00:00:00Z
source:         RIPE`;
      }
      
      setWhoisResults(results);
      setIsScanning(false);
      
      toast({
        title: "WHOIS lookup complete",
        description: "Registry information retrieved",
      });
    }, 2000);
  };

  const simulatePortScan = () => {
    const target = targetType === 'domain' ? domain : ipAddress;
    
    if (!target) {
      toast({
        title: "Target required",
        description: `Please enter a ${targetType === 'domain' ? 'domain' : 'IP address'}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsScanning(true);
    setPortScanResults(null);
    
    setTimeout(() => {
      const openPorts: { port: number; service: string; state: string; version?: string }[] = [];
      
      // Add common ports if selected
      if (portRanges.common) {
        openPorts.push(
          { port: 22, service: 'ssh', state: 'open', version: 'OpenSSH 8.2p1' },
          { port: 53, service: 'domain', state: 'open', version: 'ISC BIND 9.16.1' }
        );
      }
      
      // Add HTTP ports if selected
      if (portRanges.http) {
        openPorts.push(
          { port: 80, service: 'http', state: 'open', version: 'Apache httpd 2.4.41' },
          { port: 443, service: 'https', state: 'open', version: 'Apache httpd 2.4.41' }
        );
      }
      
      // Add mail ports if selected
      if (portRanges.mail) {
        openPorts.push(
          { port: 25, service: 'smtp', state: 'filtered' },
          { port: 143, service: 'imap', state: 'open', version: 'Dovecot imapd' },
          { port: 587, service: 'submission', state: 'open', version: 'Postfix smtpd' }
        );
      }
      
      // Add database ports if selected
      if (portRanges.database) {
        openPorts.push(
          { port: 3306, service: 'mysql', state: 'open', version: 'MySQL 8.0.27' },
          { port: 5432, service: 'postgresql', state: Math.random() > 0.5 ? 'open' : 'filtered', version: 'PostgreSQL 13.4' }
        );
      }
      
      // Add custom ports if selected
      if (portRanges.custom && customPorts.trim()) {
        const ports = customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        ports.forEach(port => {
          if (!openPorts.some(p => p.port === port)) {
            if (Math.random() > 0.7) {
              openPorts.push({ port, service: 'unknown', state: 'open' });
            }
          }
        });
      }
      
      // Sort ports by number
      openPorts.sort((a, b) => a.port - b.port);
      
      const results = `# Nmap scan report for ${target} (${targetType === 'domain' ? '203.0.113.' + Math.floor(Math.random() * 255) : ipAddress})
# Scan initiated ${new Date().toLocaleString()}
# PORT    STATE    SERVICE    VERSION
${openPorts.map(p => 
  `${p.port.toString().padEnd(8)}${p.state.padEnd(10)}${p.service.padEnd(12)}${p.version || ''}`
).join('\n')}

# Scan completed in ${(Math.random() * 10 + 5).toFixed(2)} seconds
# Found ${openPorts.length} open ports out of ${portRanges.custom ? customPorts.split(',').length : ''} scanned`;

      setPortScanResults(results);
      setIsScanning(false);
      
      toast({
        title: "Port scan complete",
        description: `Found ${openPorts.filter(p => p.state === 'open').length} open ports`,
      });
    }, 3000);
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Search className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Reconnaissance Tools</h2>
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

        <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-200/80">
            For educational purposes only. Ensure you have permission before performing reconnaissance on any system or network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm mb-2 block text-gray-300">
              Target Type
            </Label>
            <div className="flex space-x-1">
              <Button
                variant={targetType === 'domain' ? 'default' : 'outline'}
                onClick={() => setTargetType('domain')}
                className={`flex-1 ${targetType === 'domain' ? 'bg-cyber-blue hover:bg-cyber-blue/80' : ''}`}
              >
                <Globe className="h-4 w-4 mr-2" />
                Domain
              </Button>
              <Button
                variant={targetType === 'ip' ? 'default' : 'outline'}
                onClick={() => setTargetType('ip')}
                className={`flex-1 ${targetType === 'ip' ? 'bg-cyber-blue hover:bg-cyber-blue/80' : ''}`}
              >
                <Search className="h-4 w-4 mr-2" />
                IP Address
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="target" className="text-sm mb-2 block text-gray-300">
              {targetType === 'domain' ? 'Domain Name' : 'IP Address'}
            </Label>
            {targetType === 'domain' ? (
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="font-mono"
              />
            ) : (
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.1"
                className="font-mono"
              />
            )}
          </div>
        </div>

        <Tabs defaultValue="dns" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="dns">DNS Lookup</TabsTrigger>
            <TabsTrigger value="whois">WHOIS Lookup</TabsTrigger>
            <TabsTrigger value="portscan">Port Scanner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dns" className="space-y-6">
            <div className="p-4 bg-cyber-darker rounded-md">
              <h3 className="text-sm font-medium mb-2">DNS Lookup Information:</h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Retrieves DNS records for a domain (A, MX, NS, TXT, SOA, etc.)</li>
                <li>Performs reverse DNS lookup for IP addresses</li>
                <li>Shows authoritative name servers and mail servers</li>
                <li>Useful for domain reconnaissance and mail server configuration</li>
              </ul>
            </div>
            
            <Button
              onClick={simulateDnsScan}
              disabled={isScanning || !(domain || ipAddress)}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                  Performing DNS Lookup...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Perform DNS Lookup
                </>
              )}
            </Button>
            
            {dnsResults && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    DNS Lookup Results
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(dnsResults)}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleSaveResults(dnsResults, 'dns_lookup_results.txt')}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
                  {dnsResults}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="whois" className="space-y-6">
            <div className="p-4 bg-cyber-darker rounded-md">
              <h3 className="text-sm font-medium mb-2">WHOIS Lookup Information:</h3>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Retrieves registration information for domains and IP addresses</li>
                <li>Shows registrar, registration dates, nameservers, and contact info</li>
                <li>For IP addresses, shows network allocation and ASN information</li>
                <li>Useful for identifying domain ownership and network attribution</li>
              </ul>
            </div>
            
            <Button
              onClick={simulateWhoisLookup}
              disabled={isScanning || !(domain || ipAddress)}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                  Performing WHOIS Lookup...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Perform WHOIS Lookup
                </>
              )}
            </Button>
            
            {whoisResults && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    WHOIS Lookup Results
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(whoisResults)}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleSaveResults(whoisResults, 'whois_lookup_results.txt')}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
                  {whoisResults}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="portscan" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="common-ports" 
                  checked={portRanges.common}
                  onCheckedChange={(checked) => 
                    setPortRanges({...portRanges, common: checked === true})
                  }
                />
                <Label htmlFor="common-ports" className="text-sm cursor-pointer">Common</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="http-ports" 
                  checked={portRanges.http}
                  onCheckedChange={(checked) => 
                    setPortRanges({...portRanges, http: checked === true})
                  }
                />
                <Label htmlFor="http-ports" className="text-sm cursor-pointer">HTTP/S</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mail-ports" 
                  checked={portRanges.mail}
                  onCheckedChange={(checked) => 
                    setPortRanges({...portRanges, mail: checked === true})
                  }
                />
                <Label htmlFor="mail-ports" className="text-sm cursor-pointer">Mail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="db-ports" 
                  checked={portRanges.database}
                  onCheckedChange={(checked) => 
                    setPortRanges({...portRanges, database: checked === true})
                  }
                />
                <Label htmlFor="db-ports" className="text-sm cursor-pointer">Database</Label>
              </div>
            </div>
            
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id="custom-ports" 
                  checked={portRanges.custom}
                  onCheckedChange={(checked) => 
                    setPortRanges({...portRanges, custom: checked === true})
                  }
                />
                <Label htmlFor="custom-ports" className="text-sm cursor-pointer">Custom ports</Label>
              </div>
              
              <Input
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="21,23,1433,27017,8080,8443"
                className="font-mono"
                disabled={!portRanges.custom}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter comma-separated port numbers to scan
              </p>
            </div>
            
            <Button
              onClick={simulatePortScan}
              disabled={isScanning || !(domain || ipAddress) || Object.values(portRanges).every(v => v === false)}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                  Scanning Ports...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Start Port Scan
                </>
              )}
            </Button>
            
            {portScanResults && (
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-gray-300">
                    Port Scan Results
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(portScanResults)}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleSaveResults(portScanResults, 'port_scan_results.txt')}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-wrap overflow-x-auto">
                  {portScanResults}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReconTool;
