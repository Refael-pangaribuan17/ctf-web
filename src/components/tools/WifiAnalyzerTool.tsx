
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RotateCcw, Wifi, Play, Search, FileSearch, Download, Info, Zap, 
  AlertTriangle, Terminal, Copy, Eye, Shield, Network, Save, 
  Clipboard, Loader2, ArrowUpDown, Filter, RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

type Network = {
  ssid: string;
  bssid: string;
  channel: number;
  frequency: string;
  signal: number;
  security: string;
  clients: number;
  wps: boolean;
  vendor: string;
  firstSeen: string;
  lastSeen: string;
  privacy: string;
  cipher: string;
  authentication: string;
  power: number;
  beacons: number;
  ivs: number;
  lanIP?: string;
  distance?: number;
  isVulnerable: boolean;
  vulnerabilities: string[];
};

type ConnectedClient = {
  id: string;
  station: string; // MAC address
  bssid: string; // MAC of the AP it's connected to
  powerSignal: number; // in dBm
  ratePackets: number;
  beaconRate: string;
  probes: string[];
  vendor: string;
  firstSeen: string;
  lastSeen: string;
  packets: number;
  dataPackets: number;
  distance?: number;
};

type HandshakeCapture = {
  id: string;
  ssid: string;
  bssid: string;
  timestamp: string;
  status: 'captured' | 'analyzing' | 'cracked';
  password?: string;
  captureMethod: string;
  eapolCount: number;
  fileSize: string;
  filePath: string;
  channel: number;
  clientMAC?: string;
  packetDetails?: {
    total: number;
    data: number;
    control: number;
    management: number;
    eapol: number;
  }
};

type AttackSession = {
  id: string;
  type: 'deauth' | 'evil-twin' | 'mitm' | 'dns-spoof' | 'wps' | 'passive';
  targetSSID: string;
  targetBSSID: string;
  startTime: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  details: string;
  results?: string;
  capturedData?: any;
};

const FREQUENCY_BANDS = {
  1: "2.412 GHz (2.4 GHz)",
  2: "2.417 GHz (2.4 GHz)",
  3: "2.422 GHz (2.4 GHz)",
  4: "2.427 GHz (2.4 GHz)",
  5: "2.432 GHz (2.4 GHz)",
  6: "2.437 GHz (2.4 GHz)",
  7: "2.442 GHz (2.4 GHz)",
  8: "2.447 GHz (2.4 GHz)",
  9: "2.452 GHz (2.4 GHz)",
  10: "2.457 GHz (2.4 GHz)",
  11: "2.462 GHz (2.4 GHz)",
  12: "2.467 GHz (2.4 GHz)",
  13: "2.472 GHz (2.4 GHz)",
  36: "5.180 GHz (5 GHz)",
  40: "5.200 GHz (5 GHz)",
  44: "5.220 GHz (5 GHz)",
  48: "5.240 GHz (5 GHz)",
  52: "5.260 GHz (5 GHz)",
  56: "5.280 GHz (5 GHz)",
  60: "5.300 GHz (5 GHz)",
  64: "5.320 GHz (5 GHz)",
  100: "5.500 GHz (5 GHz)",
  104: "5.520 GHz (5 GHz)",
  108: "5.540 GHz (5 GHz)",
  112: "5.560 GHz (5 GHz)",
  116: "5.580 GHz (5 GHz)",
  120: "5.600 GHz (5 GHz)",
  124: "5.620 GHz (5 GHz)",
  128: "5.640 GHz (5 GHz)",
  132: "5.660 GHz (5 GHz)",
  136: "5.680 GHz (5 GHz)",
  140: "5.700 GHz (5 GHz)",
  149: "5.745 GHz (5 GHz)",
  153: "5.765 GHz (5 GHz)",
  157: "5.785 GHz (5 GHz)",
  161: "5.805 GHz (5 GHz)",
  165: "5.825 GHz (5 GHz)",
};

const WIFI_VENDORS = [
  "Cisco Systems", "Netgear", "TP-Link", "D-Link", "ASUS", 
  "Linksys", "Ubiquiti Networks", "Belkin", "Apple", "Samsung", 
  "Huawei", "Xiaomi", "Aruba Networks", "Ruckus Wireless", "Mikrotik"
];

// Add attack related constants
const ATTACK_COMMANDS = {
  deauth: [
    'aireplay-ng --deauth {COUNT} -a {BSSID} {INTERFACE}',
    'aireplay-ng --deauth {COUNT} -a {BSSID} -c {CLIENT} {INTERFACE}',
    'mdk4 {INTERFACE} d -B {BSSID} -c {CHANNEL}',
    'wifijammer -a {BSSID} -c {CHANNEL} -i {INTERFACE}'
  ],
  evilTwin: [
    'airbase-ng -a {BSSID} --essid "{SSID}" -c {CHANNEL} {INTERFACE}',
    'hostapd evil_twin.conf',
    'dnsmasq -C dnsmasq.conf',
    'sslstrip -l 10000',
    'iptables -t nat -A PREROUTING -p tcp --destination-port 80 -j REDIRECT --to-port 10000'
  ],
  mitm: [
    'ettercap -T -q -i {INTERFACE} -M arp:remote /{GATEWAY}/ /{TARGET}/',
    'bettercap -iface {INTERFACE} -eval "set arp.spoof.targets {TARGET}; arp.spoof on"',
    'wireshark -i {INTERFACE} -k -w capture.pcap'
  ],
  dnsSpoof: [
    'echo "1" > /proc/sys/net/ipv4/ip_forward',
    'iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-port 53',
    'dnsspoof -i {INTERFACE} -f hosts.txt'
  ],
  wps: [
    'reaver -i {INTERFACE} -b {BSSID} -c {CHANNEL} -vv',
    'bully {INTERFACE} -b {BSSID} -c {CHANNEL} -d'
  ],
  hashcat: [
    'hashcat -m 22000 {CAPTURE_FILE} -a 0 {WORDLIST} -r rules/best64.rule',
    'hashcat -m 22000 {CAPTURE_FILE} -a 3 ?a?a?a?a?a?a?a?a --increment',
    'hashcat -m 22000 {CAPTURE_FILE} -a 6 ?a?a?a?a?a?a wordlist.txt ?a?a'
  ],
  macSpoof: [
    'macchanger -r {INTERFACE}',
    'ifconfig {INTERFACE} down hw ether {MAC} && ifconfig {INTERFACE} up'
  ]
};

const WPS_VULNERABILITIES = [
  'WPS Pin Bruteforce (Reaver)',
  'Pixie Dust Attack (Default Pin)',
  'Known Default Pin',
  'WPS External Registrar'
];

const WEP_VULNERABILITIES = [
  'ARP Replay Attack',
  'Chop-Chop Attack',
  'Fragmentation Attack',
  'Caffe-Latte Attack',
  'PTW Attack (Weak IVs)'
];

const WPA_VULNERABILITIES = [
  'PMKID Capture & Cracking',
  'Handshake Capture & Dictionary Attack',
  'Rainbow Table Attack',
  'Known Default Passwords',
  'WPA-TKIP (Weak Implementation)'
];

const COMMON_VULNERABILITIES = [
  'Default Credentials',
  'Weak Password',
  'Management Interface Exposure',
  'Outdated Firmware',
  'Known CVEs'
];

const WifiAnalyzerTool: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedClient, setSelectedClient] = useState<ConnectedClient | null>(null);
  const [captures, setCaptures] = useState<HandshakeCapture[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [attackSessions, setAttackSessions] = useState<AttackSession[]>([]);
  const [currentAttack, setCurrentAttack] = useState<AttackSession | null>(null);
  const [dictionaryFile, setDictionaryFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanPrompt, setScanPrompt] = useState(
    "Lakukan pemindaian jaringan menggunakan mode monitor untuk mengidentifikasi semua SSID, BSSID, tingkat keamanan (WEP/WPA/WPA2/WPA3), serta perangkat yang terhubung. Urutkan perangkat berdasarkan RSSI untuk menentukan target terdekat dan identifikasi perangkat dengan WPS aktif. Simpan hasil dalam format JSON/CSV untuk analisis lebih lanjut."
  );
  const [handshakePrompt, setHandshakePrompt] = useState(
    "Jalankan serangan deauthentication pada perangkat yang terhubung ke jaringan target untuk memaksa handshake ulang. Simpan file handshake dalam format .cap untuk dilakukan cracking menggunakan Hashcat dengan kombinasi brute-force dan dictionary attack (wordlist: RockYou.txt)."
  );
  const [scanMode, setScanMode] = useState<'passive' | 'active'>('passive');
  const [useDeauth, setUseDeauth] = useState(false);
  const [deauthCount, setDeauthCount] = useState(5);
  const [captureTimeout, setCaptureTimeout] = useState(30);
  const [filterBand, setFilterBand] = useState<'all' | '2.4' | '5'>('all');
  const [filterSecurity, setFilterSecurity] = useState<'all' | 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3'>('all');
  const [filterWPS, setFilterWPS] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [interfaceMode, setInterfaceMode] = useState<'managed' | 'monitor'>('monitor');
  const [selectedInterface, setSelectedInterface] = useState('wlan0mon');
  const [sortBy, setSortBy] = useState<'signal' | 'clients' | 'channel' | 'security'>('signal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [attackType, setAttackType] = useState<'deauth' | 'evil-twin' | 'mitm' | 'dns-spoof' | 'wps'>('deauth');
  const [eviltwinOptions, setEviltwinOptions] = useState({
    useSSLStrip: true,
    captureHTTPS: true,
    useCustomDNS: false,
    usePhishingPage: true
  });
  const [customMAC, setCustomMAC] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [wpsAttackPin, setWpsAttackPin] = useState('random');
  const commandOutputRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const getFrequencyBand = (channel: number) => {
    return FREQUENCY_BANDS[channel as keyof typeof FREQUENCY_BANDS] || 
      (channel < 14 ? `${(2.407 + channel * 0.005).toFixed(3)} GHz (2.4 GHz)` : 
       channel < 36 ? "Unknown" : `${(5.000 + channel * 0.005).toFixed(3)} GHz (5 GHz)`);
  };

  const getRandomVendor = () => {
    return WIFI_VENDORS[Math.floor(Math.random() * WIFI_VENDORS.length)];
  };

  const getRandomMAC = () => {
    return Array(6).fill(0).map(() => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':').toUpperCase();
  };

  const getVulnerabilities = (network: Partial<Network>): string[] => {
    const vulnerabilities: string[] = [];
    
    if (network.wps) {
      // Pick 1-2 random WPS vulnerabilities
      vulnerabilities.push(
        ...WPS_VULNERABILITIES.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1)
      );
    }
    
    // Add security-specific vulnerabilities
    if (network.security?.includes('WEP')) {
      vulnerabilities.push(
        ...WEP_VULNERABILITIES.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
      );
    } else if (network.security?.includes('WPA')) {
      if (!network.security?.includes('WPA3')) {
        vulnerabilities.push(
          ...WPA_VULNERABILITIES.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1)
        );
      }
    }
    
    // Maybe add common vulnerabilities
    if (Math.random() > 0.7) {
      vulnerabilities.push(
        ...COMMON_VULNERABILITIES.sort(() => 0.5 - Math.random()).slice(0, 1)
      );
    }
    
    return vulnerabilities;
  };

  const generateNetworks = () => {
    const currentTime = new Date().toLocaleTimeString();
    
    const fakeNetworks: Network[] = [
      {
        ssid: "HomeNetwork",
        bssid: "00:11:22:33:44:55",
        channel: 6,
        frequency: getFrequencyBand(6),
        signal: -45,
        security: "WPA2",
        clients: 3,
        wps: true,
        vendor: "Netgear",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-PSK",
        cipher: "CCMP",
        authentication: "PSK",
        power: 45,
        beacons: 742,
        ivs: 541,
        lanIP: "192.168.1.1",
        distance: 15,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "Office_WiFi",
        bssid: "AA:BB:CC:DD:EE:FF",
        channel: 11,
        frequency: getFrequencyBand(11),
        signal: -60,
        security: "WPA2-Enterprise",
        clients: 8,
        wps: false,
        vendor: "Cisco Systems",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-EAP",
        cipher: "CCMP",
        authentication: "MGT",
        power: 30,
        beacons: 612,
        ivs: 214,
        lanIP: "10.0.0.1",
        distance: 25,
        isVulnerable: false,
        vulnerabilities: []
      },
      {
        ssid: "GuestNetwork",
        bssid: "12:34:56:78:90:AB",
        channel: 1,
        frequency: getFrequencyBand(1),
        signal: -70,
        security: "WPA2",
        clients: 1,
        wps: true,
        vendor: "TP-Link",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-PSK",
        cipher: "CCMP",
        authentication: "PSK",
        power: 20,
        beacons: 423,
        ivs: 102,
        lanIP: "192.168.0.1",
        distance: 35,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "CoffeeShop",
        bssid: "98:76:54:32:10:FE",
        channel: 3,
        frequency: getFrequencyBand(3),
        signal: -55,
        security: "WPA2",
        clients: 5,
        wps: false,
        vendor: "Ubiquiti Networks",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-PSK",
        cipher: "CCMP",
        authentication: "PSK",
        power: 35,
        beacons: 832,
        ivs: 415,
        lanIP: "172.16.0.1",
        distance: 20,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "PublicWiFi",
        bssid: "FE:DC:BA:98:76:54",
        channel: 9,
        frequency: getFrequencyBand(9),
        signal: -75,
        security: "Open",
        clients: 12,
        wps: false,
        vendor: "Aruba Networks",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "OPN",
        cipher: "",
        authentication: "",
        power: 15,
        beacons: 342,
        ivs: 1042,
        lanIP: "192.168.2.1",
        distance: 40,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "5G_Home_Network",
        bssid: "A1:B2:C3:D4:E5:F6",
        channel: 36,
        frequency: getFrequencyBand(36),
        signal: -62,
        security: "WPA3",
        clients: 2,
        wps: false,
        vendor: "ASUS",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA3-SAE",
        cipher: "CCMP",
        authentication: "SAE",
        power: 28,
        beacons: 521,
        ivs: 231,
        lanIP: "192.168.3.1",
        distance: 22,
        isVulnerable: false,
        vulnerabilities: []
      },
      {
        ssid: "IoT_Network",
        bssid: "11:22:33:44:55:66",
        channel: 2,
        frequency: getFrequencyBand(2),
        signal: -58,
        security: "WPA2",
        clients: 15,
        wps: true,
        vendor: "Xiaomi",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-PSK",
        cipher: "CCMP",
        authentication: "PSK",
        power: 32,
        beacons: 623,
        ivs: 318,
        lanIP: "192.168.4.1",
        distance: 19,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "Hidden_Network",
        bssid: "77:88:99:AA:BB:CC",
        channel: 149,
        frequency: getFrequencyBand(149),
        signal: -68,
        security: "WPA2/WPA3",
        clients: 1,
        wps: false,
        vendor: "Mikrotik",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2/WPA3",
        cipher: "CCMP",
        authentication: "PSK/SAE",
        power: 22,
        beacons: 412,
        ivs: 115,
        lanIP: "10.10.10.1",
        distance: 28,
        isVulnerable: false,
        vulnerabilities: []
      },
      {
        ssid: "Legacy_WEP",
        bssid: "EE:EE:EE:EE:EE:EE",
        channel: 5,
        frequency: getFrequencyBand(5),
        signal: -77,
        security: "WEP",
        clients: 0,
        wps: false,
        vendor: "D-Link",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WEP",
        cipher: "WEP",
        authentication: "SKA",
        power: 13,
        beacons: 241,
        ivs: 1532,
        lanIP: "192.168.0.254",
        distance: 45,
        isVulnerable: true,
        vulnerabilities: []
      },
      {
        ssid: "Enterprise_Secure",
        bssid: "00:00:5E:00:53:AF",
        channel: 40,
        frequency: getFrequencyBand(40),
        signal: -63,
        security: "WPA2-Enterprise",
        clients: 4,
        wps: false,
        vendor: "Cisco Systems",
        firstSeen: currentTime,
        lastSeen: currentTime,
        privacy: "WPA2-EAP",
        cipher: "CCMP",
        authentication: "MGT",
        power: 27,
        beacons: 542,
        ivs: 123,
        lanIP: "10.1.1.1",
        distance: 26,
        isVulnerable: false,
        vulnerabilities: []
      }
    ];
    
    // Add vulnerabilities to each network
    fakeNetworks.forEach(network => {
      network.vulnerabilities = getVulnerabilities(network);
      network.isVulnerable = network.vulnerabilities.length > 0;
    });
    
    return fakeNetworks;
  };

  const generateClients = (networks: Network[]) => {
    const currentTime = new Date().toLocaleTimeString();
    const clients: ConnectedClient[] = [];
    
    networks.forEach(network => {
      const clientCount = network.clients || 0;
      
      for (let i = 0; i < clientCount; i++) {
        const mac = getRandomMAC();
        clients.push({
          id: mac,
          station: mac,
          bssid: network.bssid,
          powerSignal: Math.round(network.signal * (0.9 + Math.random() * 0.2)), // Slightly different from AP
          ratePackets: Math.floor(Math.random() * 500) + 50,
          beaconRate: `${Math.floor(Math.random() * 270) + 1}-${Math.floor(Math.random() * 300) + 300}`,
          probes: [network.ssid],
          vendor: getRandomVendor(),
          firstSeen: currentTime,
          lastSeen: currentTime,
          packets: Math.floor(Math.random() * 10000) + 100,
          dataPackets: Math.floor(Math.random() * 1000) + 10,
          distance: Math.floor(Math.random() * 50) + 5
        });
      }
    });
    
    return clients;
  };

  const handleScan = () => {
    setIsScanning(true);
    setNetworks([]);
    setClients([]);
    setSelectedNetwork(null);
    setSelectedClient(null);
    
    // Generate command based on options
    const command = `sudo airodump-ng ${interfaceMode === 'monitor' ? selectedInterface : 'wlan0'} ${filterBand === '2.4' ? '--band a' : filterBand === '5' ? '--band bg' : ''} ${scanMode === 'passive' ? '' : '--transmit'} --manufacturer --wps --output-format csv,json -w scan_results`;
    setLastCommand(command);
    
    // Simulate network scanning
    setTimeout(() => {
      const fakeNetworks = generateNetworks();
      const fakeClients = generateClients(fakeNetworks);
      
      // Apply filters
      let filteredNetworks = [...fakeNetworks];

      // Apply frequency band filter
      if (filterBand !== 'all') {
        filteredNetworks = filteredNetworks.filter(network => {
          if (filterBand === '2.4' && network.channel <= 14) return true;
          if (filterBand === '5' && network.channel > 14) return true;
          return false;
        });
      }
      
      // Apply security filter
      if (filterSecurity !== 'all') {
        filteredNetworks = filteredNetworks.filter(network => {
          if (filterSecurity === 'open' && network.security === 'Open') return true;
          if (filterSecurity === 'wep' && network.security === 'WEP') return true;
          if (filterSecurity === 'wpa' && network.security.includes('WPA') && !network.security.includes('WPA2') && !network.security.includes('WPA3')) return true;
          if (filterSecurity === 'wpa2' && network.security.includes('WPA2')) return true;
          if (filterSecurity === 'wpa3' && network.security.includes('WPA3')) return true;
          return false;
        });
      }
      
      // Apply WPS filter
      if (filterWPS !== 'all') {
        filteredNetworks = filteredNetworks.filter(network => {
          if (filterWPS === 'enabled' && network.wps) return true;
          if (filterWPS === 'disabled' && !network.wps) return true;
          return false;
        });
      }
      
      // Sort networks
      filteredNetworks.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'signal') {
          comparison = b.signal - a.signal; // Higher signal comes first by default
        } else if (sortBy === 'clients') {
          comparison = b.clients - a.clients; // Higher client count comes first by default
        } else if (sortBy === 'channel') {
          comparison = a.channel - b.channel; // Lower channel comes first by default
        } else if (sortBy === 'security') {
          // Security ranking: Open < WEP < WPA < WPA2 < WPA3
          const securityRank = (sec: string) => {
            if (sec === 'Open') return 0;
            if (sec === 'WEP') return 1;
            if (sec.includes('WPA') && !sec.includes('WPA2') && !sec.includes('WPA3')) return 2;
            if (sec.includes('WPA2') && !sec.includes('WPA3')) return 3;
            if (sec.includes('WPA3')) return 4;
            return 0;
          };
          comparison = securityRank(a.security) - securityRank(b.security);
        }
        
        // Apply sort order
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      // Filter clients based on the filtered networks
      const filteredBSSIDs = filteredNetworks.map(network => network.bssid);
      const filteredClients = fakeClients.filter(client => filteredBSSIDs.includes(client.bssid));
      
      setNetworks(filteredNetworks);
      setClients(filteredClients);
      setIsScanning(false);
      
      toast({
        title: "Scan Complete",
        description: `Found ${filteredNetworks.length} networks and ${filteredClients.length} connected clients.`,
      });
      
      if (commandOutputRef.current) {
        commandOutputRef.current.scrollTop = commandOutputRef.current.scrollHeight;
      }
    }, 3000);
  };

  const handleCapture = () => {
    if (!selectedNetwork) return;
    
    setIsCapturing(true);
    setCaptureProgress(0);
    
    // Generate command based on options
    const deauthOption = useDeauth ? `-c ${deauthCount}` : '';
    const command = `sudo airodump-ng -c ${selectedNetwork.channel} --bssid ${selectedNetwork.bssid} -w capture_${selectedNetwork.ssid.replace(/[^a-zA-Z0-9]/g, '_')} ${interfaceMode === 'monitor' ? selectedInterface : 'wlan0'} ${deauthOption}`;
    setLastCommand(command);
    
    // If using deauth, add the deauth command
    if (useDeauth && clients.some(c => c.bssid === selectedNetwork.bssid)) {
      const targetClient = clients.find(c => c.bssid === selectedNetwork.bssid);
      const deauthCommand = `sudo aireplay-ng --deauth ${deauthCount} -a ${selectedNetwork.bssid} ${targetClient ? `-c ${targetClient.station}` : ''} ${selectedInterface}`;
      setTimeout(() => {
        setLastCommand(prev => `${prev}\n\n${deauthCommand}`);
      }, 1000);
    }
    
    // Simulate handshake capture with progress updates
    const interval = setInterval(() => {
      setCaptureProgress(prev => {
        const newProgress = prev + (useDeauth ? 15 : 10);
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Add the captured handshake to the list
          const fileSize = `${Math.floor(Math.random() * 20) + 5}KB`;
          const eapolCount = Math.floor(Math.random() * 4) + 1;
          const targetClient = clients.find(c => c.bssid === selectedNetwork.bssid);
          
          const newCapture: HandshakeCapture = {
            id: Date.now().toString(),
            ssid: selectedNetwork.ssid,
            bssid: selectedNetwork.bssid,
            timestamp: new Date().toLocaleString(),
            status: 'captured',
            captureMethod: useDeauth ? 'Targeted Deauthentication' : 'Passive Monitoring',
            eapolCount: eapolCount,
            fileSize: fileSize,
            filePath: `/tmp/capture_${selectedNetwork.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.cap`,
            channel: selectedNetwork.channel,
            clientMAC: targetClient?.station,
            packetDetails: {
              total: Math.floor(Math.random() * 1000) + 100,
              data: Math.floor(Math.random() * 500) + 50,
              control: Math.floor(Math.random() * 200) + 20,
              management: Math.floor(Math.random() * 300) + 30,
              eapol: eapolCount
            }
          };
          
          setCaptures(prev => [...prev, newCapture]);
          setIsCapturing(false);
          
          toast({
            title: "Handshake Captured",
            description: `Successfully captured handshake for ${selectedNetwork.ssid} with ${eapolCount} EAPOL frames.`,
          });
          
          // Also add an attack session for deauthentication if used
          if (useDeauth) {
            const newAttack: AttackSession = {
              id: Date.now().toString(),
              type: 'deauth',
              targetSSID: selectedNetwork.ssid,
              targetBSSID: selectedNetwork.bssid,
              startTime: new Date().toLocaleString(),
              status: 'completed',
              progress: 100,
              details: `Deauthentication attack against ${selectedNetwork.ssid} (${selectedNetwork.bssid})`,
              results: `Sent ${deauthCount} deauth packets to ${targetClient ? targetClient.station : 'all clients'}`
            };
            
            setAttackSessions(prev => [...prev, newAttack]);
          }
          
          return 100;
        }
        return newProgress;
      });
    }, useDeauth ? 400 : 800);
  };

  const startAttack = () => {
    if (!selectedNetwork) return;
    
    // Create a new attack session
    const newAttack: AttackSession = {
      id: Date.now().toString(),
      type: attackType,
      targetSSID: selectedNetwork.ssid,
      targetBSSID: selectedNetwork.bssid,
      startTime: new Date().toLocaleString(),
      status: 'running',
      progress: 0,
      details: `${attackType.toUpperCase()} attack against ${selectedNetwork.ssid}`
    };
    
    setAttackSessions(prev => [...prev, newAttack]);
    setCurrentAttack(newAttack);
    
    // Generate command based on attack type
    let command = '';
    
    switch (attackType) {
      case 'deauth':
        command = ATTACK_COMMANDS.deauth[0]
          .replace('{COUNT}', deauthCount.toString())
          .replace('{BSSID}', selectedNetwork.bssid)
          .replace('{INTERFACE}', selectedInterface);
        break;
        
      case 'evil-twin':
        command = ATTACK_COMMANDS.evilTwin[0]
          .replace('{BSSID}', customMAC || selectedNetwork.bssid)
          .replace('{SSID}', selectedNetwork.ssid)
          .replace('{CHANNEL}', selectedNetwork.channel.toString())
          .replace('{INTERFACE}', selectedInterface);
        
        // Add additional commands for evil twin
        if (eviltwinOptions.useSSLStrip) {
          command += `\n\n${ATTACK_COMMANDS.evilTwin[3]}`;
          command += `\n${ATTACK_COMMANDS.evilTwin[4]}`;
        }
        break;
        
      case 'mitm':
        command = ATTACK_COMMANDS.mitm[1]
          .replace('{INTERFACE}', selectedInterface)
          .replace('{TARGET}', selectedNetwork.lanIP || '192.168.1.0/24');
        break;
        
      case 'dns-spoof':
        command = ATTACK_COMMANDS.dnsSpoof.join('\n')
          .replace('{INTERFACE}', selectedInterface);
        break;
        
      case 'wps':
        command = ATTACK_COMMANDS.wps[0]
          .replace('{INTERFACE}', selectedInterface)
          .replace('{BSSID}', selectedNetwork.bssid)
          .replace('{CHANNEL}', selectedNetwork.channel.toString());
        break;
    }
    
    // Add MAC spoofing command if requested
    if (customMAC) {
      command = `${ATTACK_COMMANDS.macSpoof[1].replace('{INTERFACE}', selectedInterface).replace('{MAC}', customMAC)}\n\n${command}`;
    }
    
    setLastCommand(command);
    
    // Simulate attack progress
    const interval = setInterval(() => {
      setAttackSessions(prev => {
        return prev.map(attack => {
          if (attack.id === newAttack.id) {
            const newProgress = Math.min(100, attack.progress + (Math.random() * 10 + 5));
            
            // If complete, update status and results
            if (newProgress >= 100) {
              clearInterval(interval);
              
              let results = '';
              switch (attackType) {
                case 'deauth':
                  results = `Successfully sent ${deauthCount} deauthentication frames to ${selectedNetwork.bssid}`;
                  break;
                  
                case 'evil-twin':
                  results = `Created fake AP "${selectedNetwork.ssid}" on channel ${selectedNetwork.channel}. Captured ${Math.floor(Math.random() * 5)} login attempts.`;
                  break;
                  
                case 'mitm':
                  results = `Intercepted ${Math.floor(Math.random() * 1000) + 100} packets. Captured ${Math.floor(Math.random() * 10) + 1} plain-text credentials.`;
                  break;
                  
                case 'dns-spoof':
                  results = `Redirected DNS queries for ${Math.floor(Math.random() * 20) + 5} domains to attacker server.`;
                  break;
                  
                case 'wps':
                  const success = Math.random() > 0.5;
                  if (success) {
                    results = `WPS PIN recovered: ${Math.floor(Math.random() * 10000000) + 10000000}. Network password: "${Math.random().toString(36).substring(2, 10)}${Math.floor(Math.random() * 100)}"`;
                  } else {
                    results = `WPS attack failed. AP appears to have rate limiting or lockout protection.`;
                  }
                  break;
              }
              
              setCurrentAttack(null);
              
              return {
                ...attack,
                progress: 100,
                status: 'completed',
                results
              };
            }
            
            return {
              ...attack,
              progress: newProgress
            };
          }
          return attack;
        });
      });
    }, 800);
  };

  const handleAnalyze = (capture: HandshakeCapture) => {
    if (isAnalyzing) return;
    
    if (!dictionaryFile) {
      toast({
        title: "Dictionary Required",
        description: "Please upload a dictionary file for password cracking.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Update status to analyzing
    setCaptures(prev => prev.map(c => 
      c.id === capture.id ? { ...c, status: 'analyzing' } : c
    ));
    
    // Generate command
    const command = `hashcat -m 22000 ${capture.filePath} ${dictionaryFile.name} -r rules/best64.rule --force`;
    setLastCommand(command);
    
    // Simulate password cracking
    setTimeout(() => {
      // 70% chance of success for demonstration
      const success = Math.random() > 0.3;
      
      if (success) {
        const commonPasswords = [
          "password123", "admin123", "letmein", "wifi123", "12345678", 
          "qwerty123", "1q2w3e4r", "welcome1", "sunshine", "iloveyou",
          "football", "princess", "dragon123", "baseball", "superman",
          "trustno1", "butterfly", "babygirl", "monkey123", "1234abcd"
        ];
        const password = commonPasswords[Math.floor(Math.random() * commonPasswords.length)];
        
        setCaptures(prev => prev.map(c => 
          c.id === capture.id ? { ...c, status: 'cracked', password } : c
        ));
        
        toast({
          title: "Password Cracked",
          description: `Password for ${capture.ssid}: ${password}`,
        });
      } else {
        setCaptures(prev => prev.map(c => 
          c.id === capture.id ? { ...c, status: 'captured' } : c
        ));
        
        toast({
          title: "Cracking Failed",
          description: "Could not crack the password with the provided dictionary.",
          variant: "destructive",
        });
      }
      
      setIsAnalyzing(false);
    }, 5000);
  };

  const exportNetworks = () => {
    if (networks.length === 0) return;
    
    let content = '';
    const filename = `network_scan_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${exportFormat}`;
    
    if (exportFormat === 'json') {
      content = JSON.stringify(networks, null, 2);
    } else if (exportFormat === 'csv') {
      // Create CSV header
      const headers = 'SSID,BSSID,Channel,Frequency,Signal,Security,Clients,WPS,Vendor\n';
      
      // Create CSV rows
      const rows = networks.map(network => {
        return `"${network.ssid}",${network.bssid},${network.channel},"${network.frequency}",${network.signal},"${network.security}",${network.clients},${network.wps ? 'Yes' : 'No'},"${network.vendor}"`;
      }).join('\n');
      
      content = headers + rows;
    } else {
      // Text format
      content = networks.map(network => {
        return `SSID: ${network.ssid}
BSSID: ${network.bssid}
Channel: ${network.channel} (${network.frequency})
Signal: ${network.signal} dBm
Security: ${network.security}
Clients: ${network.clients}
WPS: ${network.wps ? 'Enabled' : 'Disabled'}
Vendor: ${network.vendor}
First Seen: ${network.firstSeen}
Last Seen: ${network.lastSeen}
----------------------------------`;
      }).join('\n\n');
    }
    
    // Create a blob and download link
    const blob = new Blob([content], { type: `text/${exportFormat === 'json' ? 'json' : exportFormat === 'csv' ? 'csv' : 'plain'}` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `Exported ${networks.length} networks to ${filename}`,
    });
  };

  const handleReset = () => {
    setIsScanning(false);
    setNetworks([]);
    setClients([]);
    setSelectedNetwork(null);
    setSelectedClient(null);
    setCaptures([]);
    setIsCapturing(false);
    setCaptureProgress(0);
    setDictionaryFile(null);
    setIsAnalyzing(false);
    setAttackSessions([]);
    setCurrentAttack(null);
    setLastCommand("");
  };

  const getSignalStrengthColor = (signal: number) => {
    if (signal > -50) return "bg-green-500";
    if (signal > -70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSignalStrengthText = (signal: number) => {
    if (signal > -50) return "Excellent";
    if (signal > -60) return "Good";
    if (signal > -70) return "Fair";
    if (signal > -80) return "Poor";
    return "Very Poor";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "Command copied to clipboard",
      });
    });
  };

  return (
    <div className="animate-fade-up w-full max-w-5xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Wifi className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">WiFi Security Analyzer</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mr-2"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Info className="h-3.5 w-3.5 mr-1" />
                  {showAdvancedOptions ? "Hide" : "Advanced"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle advanced scanning and attack options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
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

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="scan">Network Scanner</TabsTrigger>
            <TabsTrigger value="handshake">Handshake Analysis</TabsTrigger>
            <TabsTrigger value="attacks">Attack Simulation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scan" className="space-y-6">
            {showAdvancedOptions && (
              <div className="bg-cyber-darker border border-cyber-dark rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Advanced Scan Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scanMode">Scan Mode</Label>
                    <Select 
                      value={scanMode} 
                      onValueChange={(value) => setScanMode(value as 'passive' | 'active')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scan mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passive">Passive (Undetectable)</SelectItem>
                        <SelectItem value="active">Active (Faster, Detectable)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Passive mode only listens; active sends probe requests
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filterBand">Frequency Band</Label>
                    <Select 
                      value={filterBand} 
                      onValueChange={(value) => setFilterBand(value as 'all' | '2.4' | '5')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency band" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bands</SelectItem>
                        <SelectItem value="2.4">2.4 GHz Only</SelectItem>
                        <SelectItem value="5">5 GHz Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Filter networks by frequency band
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interfaceMode">Interface Mode</Label>
                    <Select 
                      value={interfaceMode} 
                      onValueChange={(value) => setInterfaceMode(value as 'managed' | 'monitor')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interface mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monitor">Monitor Mode</SelectItem>
                        <SelectItem value="managed">Managed Mode (Limited)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Monitor mode required for full analysis
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interface">Interface</Label>
                    <Select 
                      value={selectedInterface} 
                      onValueChange={setSelectedInterface}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select interface" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wlan0mon">wlan0mon</SelectItem>
                        <SelectItem value="wlan0">wlan0</SelectItem>
                        <SelectItem value="wlan1mon">wlan1mon</SelectItem>
                        <SelectItem value="wlan1">wlan1</SelectItem>
                        <SelectItem value="mon0">mon0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filterSecurity">Security Type</Label>
                    <Select 
                      value={filterSecurity} 
                      onValueChange={(value) => setFilterSecurity(value as 'all' | 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select security filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Security Types</SelectItem>
                        <SelectItem value="open">Open Networks</SelectItem>
                        <SelectItem value="wep">WEP (Vulnerable)</SelectItem>
                        <SelectItem value="wpa">WPA</SelectItem>
                        <SelectItem value="wpa2">WPA2</SelectItem>
                        <SelectItem value="wpa3">WPA3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filterWPS">WPS Status</Label>
                    <Select 
                      value={filterWPS} 
                      onValueChange={(value) => setFilterWPS(value as 'all' | 'enabled' | 'disabled')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select WPS filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Networks</SelectItem>
                        <SelectItem value="enabled">WPS Enabled</SelectItem>
                        <SelectItem value="disabled">WPS Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      WPS enabled networks may be vulnerable
                    </p>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3 flex space-x-4 items-center">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="sortBy">Sort By</Label>
                      <Select 
                        value={sortBy} 
                        onValueChange={(value) => setSortBy(value as 'signal' | 'clients' | 'channel' | 'security')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sort criterion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="signal">Signal Strength</SelectItem>
                          <SelectItem value="clients">Client Count</SelectItem>
                          <SelectItem value="channel">Channel Number</SelectItem>
                          <SelectItem value="security">Security Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                      </Button>
                    </div>
                    
                    <div className="pt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportNetworks()}
                        disabled={networks.length === 0}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="pt-8 flex-1">
                      <Select 
                        value={exportFormat} 
                        onValueChange={(value) => setExportFormat(value as 'json' | 'csv' | 'txt')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Export format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON Format</SelectItem>
                          <SelectItem value="csv">CSV Format</SelectItem>
                          <SelectItem value="txt">Text Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-3">
                    <Textarea 
                      placeholder="Custom scan command..." 
                      value={scanPrompt}
                      onChange={(e) => setScanPrompt(e.target.value)}
                      className="h-24 font-mono text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Natural language prompt for scan operation
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="w-full">
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scanning Networks...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Scan for WiFi Networks
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 mt-1">
                This will scan for nearby WiFi networks in {interfaceMode} mode{scanMode === 'passive' ? ' (passive)' : ' (active)'}.
                {showAdvancedOptions && (
                  <>
                    {' '}Filtering for {filterBand === 'all' ? 'all bands' : filterBand === '2.4' ? '2.4 GHz' : '5 GHz'}, 
                    {filterSecurity === 'all' ? ' all security types' : ` ${filterSecurity} security`}, 
                    {filterWPS === 'all' ? ' all WPS status' : filterWPS === 'enabled' ? ' WPS enabled' : ' WPS disabled'}.
                  </>
                )}
              </p>
            </div>
            
            {lastCommand && (
              <div className="w-full font-mono text-xs bg-black/50 rounded-md p-3 border border-gray-700 overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                    <span className="text-green-500">Command:</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(lastCommand)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="h-24" ref={commandOutputRef}>
                  <pre className="text-gray-300 whitespace-pre-wrap">{lastCommand}</pre>
                </ScrollArea>
              </div>
            )}
            
            {networks.length > 0 && (
              <>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm text-gray-300">
                      Detected Networks ({networks.length})
                    </Label>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {filterBand === 'all' ? 'All Bands' : filterBand === '2.4' ? '2.4 GHz Only' : '5 GHz Only'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Sorted by {sortBy} ({sortOrder === 'asc' ? 'asc' : 'desc'})
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-cyber-dark/50">
                            <th className="px-4 py-2 text-left">
                              <Button variant="ghost" size="sm" className="h-5 -ml-3" onClick={() => {
                                setSortBy('signal');
                                setSortOrder(sortBy === 'signal' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc');
                              }}>
                                SSID {sortBy === 'signal' && <ArrowUpDown className="h-3 w-3 ml-1 inline" />}
                              </Button>
                            </th>
                            <th className="px-4 py-2 text-left">BSSID</th>
                            <th className="px-4 py-2 text-center">
                              <Button variant="ghost" size="sm" className="h-5 -ml-3" onClick={() => {
                                setSortBy('channel');
                                setSortOrder(sortBy === 'channel' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                              }}>
                                CH {sortBy === 'channel' && <ArrowUpDown className="h-3 w-3 ml-1 inline" />}
                              </Button>
                            </th>
                            <th className="px-4 py-2 text-left">Frequency</th>
                            <th className="px-4 py-2 text-center">
                              <Button variant="ghost" size="sm" className="h-5 -ml-3" onClick={() => {
                                setSortBy('signal');
                                setSortOrder(sortBy === 'signal' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc');
                              }}>
                                Signal {sortBy === 'signal' && <ArrowUpDown className="h-3 w-3 ml-1 inline" />}
                              </Button>
                            </th>
                            <th className="px-4 py-2 text-left">
                              <Button variant="ghost" size="sm" className="h-5 -ml-3" onClick={() => {
                                setSortBy('security');
                                setSortOrder(sortBy === 'security' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                              }}>
                                Security {sortBy === 'security' && <ArrowUpDown className="h-3 w-3 ml-1 inline" />}
                              </Button>
                            </th>
                            <th className="px-4 py-2 text-center">
                              <Button variant="ghost" size="sm" className="h-5 -ml-3" onClick={() => {
                                setSortBy('clients');
                                setSortOrder(sortBy === 'clients' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'desc');
                              }}>
                                Clients {sortBy === 'clients' && <ArrowUpDown className="h-3 w-3 ml-1 inline" />}
                              </Button>
                            </th>
                            <th className="px-4 py-2 text-center">WPS</th>
                            <th className="px-4 py-2 text-center">Vuln</th>
                            <th className="px-4 py-2 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {networks.map((network, index) => (
                            <tr 
                              key={network.bssid} 
                              className={`border-t border-cyber-dark/50 ${
                                selectedNetwork?.bssid === network.bssid ? 'bg-cyber-blue/10' : ''
                              } hover:bg-cyber-dark/30 cursor-pointer`}
                              onClick={() => {
                                setSelectedNetwork(network);
                                setSelectedClient(null);
                              }}
                            >
                              <td className="px-4 py-2">{network.ssid}</td>
                              <td className="px-4 py-2 font-mono text-xs">{network.bssid}</td>
                              <td className="px-4 py-2 text-center">{network.channel}</td>
                              <td className="px-4 py-2 text-xs">{network.frequency}</td>
                              <td className="px-4 py-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center justify-center">
                                        <div className="w-16 bg-gray-700 rounded-full h-1.5 mr-2">
                                          <div 
                                            className={`h-1.5 rounded-full ${getSignalStrengthColor(network.signal)}`} 
                                            style={{ width: `${Math.min(100, (100 + network.signal) * 1.5)}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs">{network.signal} dBm</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{getSignalStrengthText(network.signal)} Signal</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                              <td className="px-4 py-2">{network.security}</td>
                              <td className="px-4 py-2 text-center">{network.clients}</td>
                              <td className="px-4 py-2 text-center">
                                {network.wps ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="text-green-500">✓</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>WPS Enabled (Potentially Vulnerable)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : "—"}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {network.isVulnerable ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Potential vulnerabilities detected</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Shield className="h-4 w-4 text-green-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>No obvious vulnerabilities</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNetwork(network);
                                    setSelectedClient(null);
                                  }}
                                >
                                  Select
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              
                {clients.length > 0 && (
                  <div className="w-full mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-gray-300">
                        Connected Clients ({clients.length})
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        Associated with {clients.filter(c => selectedNetwork ? c.bssid === selectedNetwork.bssid : true).length} networks
                      </Badge>
                    </div>
                    <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-cyber-dark/50">
                              <th className="px-4 py-2 text-left">Station MAC</th>
                              <th className="px-4 py-2 text-left">Connected To</th>
                              <th className="px-4 py-2 text-center">Signal</th>
                              <th className="px-4 py-2 text-center">Packets</th>
                              <th className="px-4 py-2 text-left">Vendor</th>
                              <th className="px-4 py-2 text-left">First Seen</th>
                              <th className="px-4 py-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients
                              .filter(client => selectedNetwork ? client.bssid === selectedNetwork.bssid : true)
                              .map((client) => (
                              <tr 
                                key={client.id} 
                                className={`border-t border-cyber-dark/50 ${
                                  selectedClient?.id === client.id ? 'bg-cyber-blue/10' : ''
                                } hover:bg-cyber-dark/30 cursor-pointer`}
                                onClick={() => {
                                  setSelectedClient(client);
                                  // Also select the associated network if not already selected
                                  if (!selectedNetwork || selectedNetwork.bssid !== client.bssid) {
                                    const network = networks.find(n => n.bssid === client.bssid);
                                    if (network) setSelectedNetwork(network);
                                  }
                                }}
                              >
                                <td className="px-4 py-2 font-mono text-xs">{client.station}</td>
                                <td className="px-4 py-2 font-mono text-xs">{client.bssid}</td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex items-center justify-center">
                                    <span className="text-xs">{client.powerSignal} dBm</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-center text-xs">{client.packets}</td>
                                <td className="px-4 py-2 text-xs">{client.vendor}</td>
                                <td className="px-4 py-2 text-xs">{client.firstSeen}</td>
                                <td className="px-4 py-2 text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedClient(client);
                                      // Also select the associated network
                                      const network = networks.find(n => n.bssid === client.bssid);
                                      if (network) setSelectedNetwork(network);
                                    }}
                                  >
                                    Select
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {selectedNetwork && (
              <Card className="bg-cyber-darker border-cyber-dark">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-medium">{selectedNetwork.ssid}</CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">{selectedNetwork.bssid}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{selectedNetwork.security}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        <Badge variant="outline" className="mr-1">
                          Ch {selectedNetwork.channel}
                        </Badge>
                        <Badge variant="outline" className="bg-cyber-dark/30">
                          {selectedNetwork.frequency.includes('2.4') ? '2.4 GHz' : '5 GHz'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Vendor:</span>
                      <span className="font-medium">{selectedNetwork.vendor}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Clients:</span>
                      <span className="font-medium">{selectedNetwork.clients}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Signal:</span>
                      <span className="font-medium">{selectedNetwork.signal} dBm ({getSignalStrengthText(selectedNetwork.signal)})</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">WPS:</span>
                      <span className="font-medium">{selectedNetwork.wps ? "Enabled" : "Disabled"}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Privacy:</span>
                      <span className="font-medium">{selectedNetwork.privacy}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Cipher:</span>
                      <span className="font-medium">{selectedNetwork.cipher || "N/A"}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Authentication:</span>
                      <span className="font-medium">{selectedNetwork.authentication || "N/A"}</span>
                    </div>
                    <div className="flex justify-between bg-cyber-dark/40 p-2 rounded-md">
                      <span className="text-gray-400">Power:</span>
                      <span className="font-medium">{selectedNetwork.power} dBm</span>
                    </div>
                  </div>
                  
                  {selectedNetwork.isVulnerable && selectedNetwork.vulnerabilities.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <h3 className="text-sm font-medium text-amber-200">Potential Vulnerabilities</h3>
                      </div>
                      <ul className="text-xs space-y-1 text-amber-100/80">
                        {selectedNetwork.vulnerabilities.map((vuln, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-amber-500 mr-1.5">•</span>
                            {vuln}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedClient && (
                    <div className="mb-4 p-3 bg-cyber-dark/40 border border-cyber-dark rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Selected Client</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setSelectedClient(null)}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Station:</span>
                          <span className="font-mono">{selectedClient.station}</span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Signal:</span>
                          <span>{selectedClient.powerSignal} dBm</span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Packets:</span>
                          <span>{selectedClient.packets}</span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Data Packets:</span>
                          <span>{selectedClient.dataPackets}</span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Vendor:</span>
                          <span>{selectedClient.vendor}</span>
                        </div>
                        <div className="flex justify-between p-1.5">
                          <span className="text-gray-400">Last Seen:</span>
                          <span>{selectedClient.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {showAdvancedOptions && (
                    <div className="mb-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        <Label htmlFor="useDeauth" className="text-sm flex-1">
                          Use Deauthentication
                          <p className="text-xs text-gray-400 mt-0.5">
                            Speed up handshake capture by disconnecting clients
                          </p>
                        </Label>
                        <Switch 
                          id="useDeauth" 
                          checked={useDeauth} 
                          onCheckedChange={setUseDeauth}
                        />
                      </div>
                      
                      {useDeauth && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="deauthCount" className="text-sm">
                              Deauth Packets
                            </Label>
                            <Select 
                              value={deauthCount.toString()} 
                              onValueChange={(value) => setDeauthCount(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Deauth count" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 (Minimal)</SelectItem>
                                <SelectItem value="5">5 (Default)</SelectItem>
                                <SelectItem value="10">10 (Aggressive)</SelectItem>
                                <SelectItem value="20">20 (Very Aggressive)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="captureTimeout" className="text-sm">
                              Capture Timeout
                            </Label>
                            <Select 
                              value={captureTimeout.toString()} 
                              onValueChange={(value) => setCaptureTimeout(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Timeout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      
                      <Textarea 
                        placeholder="Custom handshake capture command..." 
                        value={handshakePrompt}
                        onChange={(e) => setHandshakePrompt(e.target.value)}
                        className="h-24 font-mono text-xs mt-4"
                      />
                    </div>
                  )}
                  
                  {useDeauth && (
                    <div className="mb-4 p-2 bg-amber-900/30 border border-amber-500/30 rounded flex items-start">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-xs text-amber-200">
                        Deauthentication will disconnect all clients from this network temporarily. 
                        Only use for authorized penetration testing.
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Button
                      onClick={handleCapture}
                      disabled={isCapturing}
                      className="bg-cyber-blue hover:bg-cyber-blue/80"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Capturing Handshake...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Capture WPA Handshake
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNetwork(null)}
                    >
                      Deselect Network
                    </Button>
                  </div>
                  
                  {isCapturing && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <div>Capturing handshake: {captureProgress}%</div>
                        <div>Time remaining: ~{Math.ceil((100 - captureProgress) / (useDeauth ? 15 : 10) * (useDeauth ? 0.4 : 0.8))}s</div>
                      </div>
                      <Progress value={captureProgress} className="h-2" />
                      <p className="text-xs text-gray-400 mt-2">
                        {useDeauth ? (
                          <>Sending deauthentication packets to trigger reconnections and capture EAPOL handshake frames...</>
                        ) : (
                          <>Waiting for clients to connect/reconnect to capture authentication handshake...</>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="handshake" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="dictionary" className="text-sm mb-2 block text-gray-300">
                Upload Dictionary File for Password Cracking
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dictionary"
                  type="file"
                  onChange={(e) => setDictionaryFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                {dictionaryFile && (
                  <Button variant="outline" size="sm" onClick={() => setDictionaryFile(null)}>
                    Clear
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Upload a wordlist file for password cracking (e.g., rockyou.txt)
              </p>
            </div>
            
            {showAdvancedOptions && (
              <div className="bg-cyber-darker border border-cyber-dark rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium mb-3">Handshake Analysis Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="attackMethod" className="text-sm">
                      Password Attack Method
                    </Label>
                    <RadioGroup defaultValue="dictionary">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dictionary" id="dictionary" />
                        <Label htmlFor="dictionary" className="text-sm">Dictionary Attack</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bruteforce" id="bruteforce" />
                        <Label htmlFor="bruteforce" className="text-sm">Brute Force</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hybrid" id="hybrid" />
                        <Label htmlFor="hybrid" className="text-sm">Hybrid Attack</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hashcatOptions" className="text-sm">
                      Hashcat Options
                    </Label>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useRules" />
                        <Label htmlFor="useRules" className="text-xs">Use Rules (best64.rule)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useOptimized" defaultChecked />
                        <Label htmlFor="useOptimized" className="text-xs">Use Optimized Kernel</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useGPU" defaultChecked />
                        <Label htmlFor="useGPU" className="text-xs">Use GPU Acceleration</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Textarea 
                  placeholder="Custom handshake analysis command..." 
                  value={handshakePrompt}
                  onChange={(e) => setHandshakePrompt(e.target.value)}
                  className="h-24 font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Natural language prompt for handshake analysis
                </p>
                
                <div className="mt-4 text-xs text-gray-300">
                  <p className="font-medium mb-1">Sample Commands:</p>
                  <ul className="bg-black/30 p-2 rounded font-mono space-y-1 border border-gray-700">
                    <li className="ml-4">• airmon-ng start wlan0</li>
                    <li className="ml-4">• airodump-ng wlan0mon</li>
                    <li className="ml-4">• airodump-ng -c [channel] --bssid [bssid] -w [file] wlan0mon</li>
                    <li className="ml-4">• aireplay-ng -0 5 -a [bssid] wlan0mon</li>
                    <li className="ml-4">• hashcat -m 22000 [file.cap] [wordlist] -r rules/best64.rule</li>
                    <li className="ml-4">• hcxpcapngtool -o hashfile.hc22000 capture.cap</li>
                    <li className="ml-4">• hcxdumptool -i wlan0mon -o capture.pcapng --enable_status=1</li>
                  </ul>
                </div>
              </div>
            )}
            
            {lastCommand && (
              <div className="w-full font-mono text-xs bg-black/50 rounded-md p-3 border border-gray-700 overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                    <span className="text-green-500">Command:</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(lastCommand)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <ScrollArea className="h-24" ref={commandOutputRef}>
                  <pre className="text-gray-300 whitespace-pre-wrap">{lastCommand}</pre>
                </ScrollArea>
              </div>
            )}
            
            {captures.length > 0 ? (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Captured Handshakes
                </Label>
                <div className="space-y-3">
                  {captures.map((capture) => (
                    <Card 
                      key={capture.id} 
                      className="bg-cyber-darker border-cyber-dark"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="font-medium text-base">{capture.ssid}</CardTitle>
                            <CardDescription className="text-xs font-mono mt-1">
                              {capture.bssid}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={`${
                              capture.status === 'cracked' 
                                ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                                : capture.status === 'analyzing'
                                  ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
                                  : 'bg-gray-900/30 text-gray-400 border-gray-500/50'
                            } px-2 py-1 text-xs font-medium`}
                          >
                            {capture.status === 'cracked' 
                              ? 'Cracked' 
                              : capture.status === 'analyzing'
                                ? 'Analyzing...'
                                : 'Captured'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Captured</div>
                            <div className="mt-0.5 text-xs">{capture.timestamp}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">Method</div>
                            <div className="mt-0.5 text-xs">{capture.captureMethod}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">EAPOL Frames</div>
                            <div className="mt-0.5 text-xs">{capture.eapolCount}</div>
                          </div>
                          <div className="bg-cyber-dark/40 p-2 rounded-md">
                            <div className="text-xs text-gray-400">File Size</div>
                            <div className="mt-0.5 text-xs">{capture.fileSize}</div>
                          </div>
                        </div>
                        
                        <Accordion type="single" collapsible className="mb-3">
                          <AccordionItem value="details">
                            <AccordionTrigger className="text-xs py-2">
                              Technical Details
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="font-mono text-xs bg-black/30 p-2 rounded border border-gray-700 mb-2">
                                <div className="text-gray-400">File Path:</div>
                                <div className="mt-0.5 text-gray-300">{capture.filePath}</div>
                              </div>
                              
                              {capture.packetDetails && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                  <div className="bg-cyber-dark/40 p-2 rounded-md">
                                    <div className="text-gray-400">Total Packets</div>
                                    <div className="mt-0.5 font-medium">{capture.packetDetails.total}</div>
                                  </div>
                                  <div className="bg-cyber-dark/40 p-2 rounded-md">
                                    <div className="text-gray-400">Data</div>
                                    <div className="mt-0.5 font-medium">{capture.packetDetails.data}</div>
                                  </div>
                                  <div className="bg-cyber-dark/40 p-2 rounded-md">
                                    <div className="text-gray-400">Control</div>
                                    <div className="mt-0.5 font-medium">{capture.packetDetails.control}</div>
                                  </div>
                                  <div className="bg-cyber-dark/40 p-2 rounded-md">
                                    <div className="text-gray-400">Management</div>
                                    <div className="mt-0.5 font-medium">{capture.packetDetails.management}</div>
                                  </div>
                                  <div className="bg-cyber-dark/40 p-2 rounded-md">
                                    <div className="text-gray-400">EAPOL</div>
                                    <div className="mt-0.5 font-medium">{capture.packetDetails.eapol}</div>
                                  </div>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="commands">
                            <AccordionTrigger className="text-xs py-2">
                              Analysis Commands
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 font-mono text-xs">
                                <div>
                                  <p className="text-gray-400 mb-1"># Convert capture file to hashcat format</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hcxpcapngtool -o {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 {capture.filePath}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Crack with hashcat</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hashcat -m 22000 {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 wordlist.txt -r rules/best64.rule
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Check if capture has handshake</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    aircrack-ng {capture.filePath}
                                  </code>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        {capture.status === 'cracked' && capture.password && (
                          <div className="mb-3 p-3 bg-green-900/20 border border-green-500/30 rounded">
                            <div className="flex items-center">
                              <Zap className="h-4 w-4 text-green-400 mr-2" />
                              <div className="text-sm font-medium text-green-400">Password Cracked!</div>
                            </div>
                            <div className="mt-2 font-mono text-green-400 bg-black/40 p-2 rounded border border-green-500/20">
                              {capture.password}
                            </div>
                            <div className="mt-2 text-xs text-gray-400 flex items-center">
                              <div className="flex-1">
                                Attack: Dictionary with rules
                              </div>
                              <div>
                                Time: {Math.floor(Math.random() * 60) + 5}s
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAnalyze(capture)}
                            disabled={!dictionaryFile || capture.status === 'analyzing' || capture.status === 'cracked' || isAnalyzing}
                            className={`flex-1 ${capture.status === 'cracked' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-cyber-blue hover:bg-cyber-blue/80'}`}
                          >
                            {capture.status === 'analyzing' ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : capture.status === 'cracked' ? (
                              <>
                                <FileSearch className="h-4 w-4 mr-2" />
                                Already Cracked
                              </>
                            ) : (
                              <>
                                <FileSearch className="h-4 w-4 mr-2" />
                                Crack Password
                              </>
                            )}
                          </Button>
                          
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Save Capture
                          </Button>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Terminal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-0">
                              <div className="p-3 border-b border-border">
                                <h4 className="font-medium text-sm">Handshake Analysis Commands</h4>
                              </div>
                              <div className="p-3 space-y-2 font-mono text-xs">
                                <div>
                                  <p className="text-gray-400 mb-1"># Convert capture file to hashcat format</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hcxpcapngtool -o {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 {capture.filePath}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Crack with hashcat</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hashcat -m 22000 {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 wordlist.txt -r rules/best64.rule
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Check if capture has handshake</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    aircrack-ng {capture.filePath}
                                  </code>
                                </div>
                                <div>
                                  <p className="text-gray-400 mb-1"># Brute force attack</p>
                                  <code className="bg-black/30 p-1.5 rounded block border border-gray-700">
                                    hashcat -m 22000 {capture.ssid.replace(/[^a-zA-Z0-9]/g, '_')}.hc22000 -a 3 ?a?a?a?a?a?a?a?a --increment
                                  </code>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full p-8 bg-cyber-darker border border-cyber-dark rounded-md text-center">
                <Wifi className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-400">No Handshakes Captured</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Go to the Network Scanner tab to scan for networks and capture handshakes.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="attacks" className="space-y-6">
            <div className="bg-cyber-darker border border-cyber-dark rounded-md p-4 mb-4">
              <h3 className="text-sm font-medium mb-3">Attack Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="attackType" className="text-sm">Attack Type</Label>
                  <Select 
                    value={attackType} 
                    onValueChange={(value) => setAttackType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select attack type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deauth">Deauthentication</SelectItem>
                      <SelectItem value="evil-twin">Evil Twin AP</SelectItem>
                      <SelectItem value="mitm">Man-in-the-Middle</SelectItem>
                      <SelectItem value="dns-spoof">DNS Spoofing</SelectItem>
                      <SelectItem value="wps">WPS Attack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interface">Interface</Label>
                  <Select 
                    value={selectedInterface} 
                    onValueChange={setSelectedInterface}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interface" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wlan0mon">wlan0mon</SelectItem>
                      <SelectItem value="wlan0">wlan0</SelectItem>
                      <SelectItem value="wlan1mon">wlan1mon</SelectItem>
                      <SelectItem value="wlan1">wlan1</SelectItem>
                      <SelectItem value="mon0">mon0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customMAC" className="text-sm">
                    Custom MAC Address (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="customMAC"
                      placeholder="00:11:22:33:44:55"
                      value={customMAC}
                      onChange={(e) => setCustomMAC(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomMAC(getRandomMAC())}
                      className="whitespace-nowrap"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Random
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use MAC spoofing to hide your identity
                  </p>
                </div>
              </div>
              
              {attackType === 'deauth' && (
                <div className="mb-4 p-3 border border-gray-700 rounded">
                  <h4 className="text-sm font-medium mb-2">Deauthentication Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deauthCount" className="text-sm">
                        Deauth Packets
                      </Label>
                      <Select 
                        value={deauthCount.toString()} 
                        onValueChange={(value) => setDeauthCount(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Deauth count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 (Minimal)</SelectItem>
                          <SelectItem value="5">5 (Default)</SelectItem>
                          <SelectItem value="10">10 (Aggressive)</SelectItem>
                          <SelectItem value="20">20 (Very Aggressive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="targetSpecific" />
                      <Label htmlFor="targetSpecific" className="text-sm">Target specific client only</Label>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700">
                    <span className="text-gray-400">Command: </span>
                    <code className="text-gray-300">
                      {selectedClient ? 
                        `aireplay-ng --deauth ${deauthCount} -a ${selectedNetwork?.bssid || '[bssid]'} -c ${selectedClient.station} ${selectedInterface}` :
                        `aireplay-ng --deauth ${deauthCount} -a ${selectedNetwork?.bssid || '[bssid]'} ${selectedInterface}`
                      }
                    </code>
                  </div>
                </div>
              )}
              
              {attackType === 'evil-twin' && (
                <div className="mb-4 p-3 border border-gray-700 rounded">
                  <h4 className="text-sm font-medium mb-2">Evil Twin Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="useSSLStrip" 
                          checked={eviltwinOptions.useSSLStrip}
                          onCheckedChange={(checked) => setEviltwinOptions({...eviltwinOptions, useSSLStrip: !!checked})}
                        />
                        <Label htmlFor="useSSLStrip" className="text-sm">Use SSLStrip</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="captureHTTPS" 
                          checked={eviltwinOptions.captureHTTPS}
                          onCheckedChange={(checked) => setEviltwinOptions({...eviltwinOptions, captureHTTPS: !!checked})}
                        />
                        <Label htmlFor="captureHTTPS" className="text-sm">Capture HTTPS traffic</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="useCustomDNS" 
                          checked={eviltwinOptions.useCustomDNS}
                          onCheckedChange={(checked) => setEviltwinOptions({...eviltwinOptions, useCustomDNS: !!checked})}
                        />
                        <Label htmlFor="useCustomDNS" className="text-sm">Use custom DNS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="usePhishingPage" 
                          checked={eviltwinOptions.usePhishingPage}
                          onCheckedChange={(checked) => setEviltwinOptions({...eviltwinOptions, usePhishingPage: !!checked})}
                        />
                        <Label htmlFor="usePhishingPage" className="text-sm">Use phishing captive portal</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700">
                    <span className="text-gray-400">Commands: </span>
                    <code className="text-gray-300 whitespace-pre-wrap">
                      {`airbase-ng -a ${customMAC || (selectedNetwork?.bssid || '[bssid]')} --essid "${selectedNetwork?.ssid || '[ssid]'}" -c ${selectedNetwork?.channel || '[channel]'} ${selectedInterface}
#Start DHCP server
dnsmasq -C dnsmasq.conf -i at0
#Enable routing
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
${eviltwinOptions.useSSLStrip ? 'sslstrip -l 10000' : ''}
${eviltwinOptions.useSSLStrip ? 'iptables -t nat -A PREROUTING -p tcp --destination-port 80 -j REDIRECT --to-port 10000' : ''}
${eviltwinOptions.usePhishingPage ? 'service apache2 start' : ''}`
                      }
                    </code>
                  </div>
                </div>
              )}
              
              {attackType === 'mitm' && (
                <div className="mb-4 p-3 border border-gray-700 rounded">
                  <h4 className="text-sm font-medium mb-2">Man-in-the-Middle Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useSslStrip" defaultChecked />
                        <Label htmlFor="useSslStrip" className="text-sm">Use SSLStrip</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useArpPoison" defaultChecked />
                        <Label htmlFor="useArpPoison" className="text-sm">Use ARP Poisoning</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="capturePasswords" defaultChecked />
                        <Label htmlFor="capturePasswords" className="text-sm">Capture passwords</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="sniffEmails" />
                        <Label htmlFor="sniffEmails" className="text-sm">Sniff emails</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700">
                    <span className="text-gray-400">Commands: </span>
                    <code className="text-gray-300 whitespace-pre-wrap">
                      {`# Use ettercap for ARP poisoning
ettercap -T -q -i ${selectedInterface} -M arp:remote /${selectedNetwork?.lanIP || '192.168.1.1'}/ /192.168.1.0-192.168.1.255/

# Or use bettercap for more features
bettercap -iface ${selectedInterface} -eval "set arp.spoof.targets 192.168.1.0/24; arp.spoof on; net.sniff on"

# To capture credentials
bettercap -iface ${selectedInterface} -eval "set arp.spoof.targets 192.168.1.0/24; arp.spoof on; net.sniff on; http.proxy on; http.proxy.sslstrip on"

# To save capture to file
tcpdump -i ${selectedInterface} -w capture.pcap host ${selectedNetwork?.lanIP || '192.168.1.1'}`
                      }
                    </code>
                  </div>
                </div>
              )}
              
              {attackType === 'dns-spoof' && (
                <div className="mb-4 p-3 border border-gray-700 rounded">
                  <h4 className="text-sm font-medium mb-2">DNS Spoofing Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input placeholder="Domain to spoof (e.g., example.com)" />
                      <Input placeholder="Redirect IP (e.g., 192.168.1.100)" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useWildcard" defaultChecked />
                        <Label htmlFor="useWildcard" className="text-sm">Use wildcard (*) spoofing</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="useCustomDnsttl" />
                        <Label htmlFor="useCustomDnsttl" className="text-sm">Use custom DNS TTL</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700">
                    <span className="text-gray-400">Commands: </span>
                    <code className="text-gray-300 whitespace-pre-wrap">
                      {`# Setup DNS spoofing with ettercap
echo "example.com A 192.168.1.100" > dns.conf
echo "*.example.com A 192.168.1.100" >> dns.conf

# Enable IP forwarding
echo "1" > /proc/sys/net/ipv4/ip_forward

# Setup iptables for DNS redirection
iptables -t nat -A PREROUTING -p udp --dport 53 -j REDIRECT --to-port 53

# Start the attack
ettercap -T -q -i ${selectedInterface} -P dns_spoof -M arp:remote /${selectedNetwork?.lanIP || '192.168.1.1'}/ // dns.conf

# Alternative with bettercap
bettercap -iface ${selectedInterface} -eval "set dns.spoof.domains *.example.com, example.com; set dns.spoof.address 192.168.1.100; dns.spoof on; arp.spoof on"`
                      }
                    </code>
                  </div>
                </div>
              )}
              
              {attackType === 'wps' && (
                <div className="mb-4 p-3 border border-gray-700 rounded">
                  <h4 className="text-sm font-medium mb-2">WPS Attack Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wpsAttack" className="text-sm">WPS Attack Method</Label>
                      <Select
                        value={wpsAttackPin}
                        onValueChange={setWpsAttackPin}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="random">Random PIN Brute Force</SelectItem>
                          <SelectItem value="pixie">Pixie Dust Attack</SelectItem>
                          <SelectItem value="known">Known Default PINs</SelectItem>
                          <SelectItem value="online">Online PIN Calculation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wpsTimeout" className="text-sm">Timeout Between Attempts</Label>
                      <Select defaultValue="1.0">
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5 seconds (Aggressive)</SelectItem>
                          <SelectItem value="1.0">1.0 seconds (Default)</SelectItem>
                          <SelectItem value="2.0">2.0 seconds (Safe)</SelectItem>
                          <SelectItem value="5.0">5.0 seconds (Stealthy)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs bg-black/30 p-2 rounded border border-gray-700">
                    <span className="text-gray-400">Commands: </span>
                    <code className="text-gray-300 whitespace-pre-wrap">
                      {wpsAttackPin === 'pixie' ? 
                        `# Pixie Dust attack with Reaver
reaver -i ${selectedInterface} -b ${selectedNetwork?.bssid || '[bssid]'} -c ${selectedNetwork?.channel || '[channel]'} -K 1 -vv` :
                        wpsAttackPin === 'known' ?
                        `# Try known default PINs
reaver -i ${selectedInterface} -b ${selectedNetwork?.bssid || '[bssid]'} -c ${selectedNetwork?.channel || '[channel]'} -n -v` :
                        `# Brute force WPS PIN
reaver -i ${selectedInterface} -b ${selectedNetwork?.bssid || '[bssid]'} -c ${selectedNetwork?.channel || '[channel]'} -vv

# Alternative with bully
bully ${selectedInterface} -b ${selectedNetwork?.bssid || '[bssid]'} -c ${selectedNetwork?.channel || '[channel]'} -d`
                      }
                    </code>
                  </div>
                </div>
              )}
              
              <div className="p-2 bg-amber-900/30 border border-amber-500/30 rounded flex items-start">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-amber-200">
                  These attack simulations are for educational purposes only. Using these techniques against networks without explicit permission is illegal and unethical. Always practice responsible security testing.
                </p>
              </div>
            </div>
            
            <div className="w-full">
              <Button
                onClick={startAttack}
                disabled={!selectedNetwork || !!currentAttack}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {currentAttack ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Attack in Progress...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start {attackType.charAt(0).toUpperCase() + attackType.slice(1)} Attack
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-400 mt-1">
                {!selectedNetwork ? "Select a network target from the scanner tab first." : 
                  `This will simulate a ${attackType} attack against ${selectedNetwork.ssid} (${selectedNetwork.bssid}).`}
              </p>
            </div>
            
            {lastCommand && (
              <div className="w-full font-mono text-xs bg-black/50 rounded-md p-3 border border-gray-700 overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                    <span className="text-green-500">Command:</span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => setShowRawOutput(!showRawOutput)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(lastCommand)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className={showRawOutput ? "h-64" : "h-24"} ref={commandOutputRef}>
                  <pre className="text-gray-300 whitespace-pre-wrap">{lastCommand}</pre>
                  {showRawOutput && (
                    <>
                      <div className="mt-2 mb-1 border-t border-gray-700 pt-2">
                        <span className="text-green-500">Output:</span>
                      </div>
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {currentAttack ? 
                          `Running ${currentAttack.type} attack against ${currentAttack.targetSSID}...
Progress: ${Math.round(currentAttack.progress)}%

${attackType === 'deauth' ? 
  `Sending deauthentication packets to ${selectedNetwork?.bssid || '[bssid]'}
Sent ${Math.round(currentAttack.progress/10)} deauth packets so far...
` : 
attackType === 'evil-twin' ? 
  `Created fake access point with SSID: ${selectedNetwork?.ssid || '[ssid]'}
Channel: ${selectedNetwork?.channel || '[channel]'}
MAC address: ${customMAC || selectedNetwork?.bssid || '[bssid]'}
Waiting for clients to connect...
` :
attackType === 'mitm' ?
  `Performing ARP poisoning attack...
Target gateway: ${selectedNetwork?.lanIP || '192.168.1.1'}
Intercepted ${Math.floor(Math.random() * 100) + 10} packets so far...
` :
attackType === 'dns-spoof' ?
  `DNS spoofing active...
Redirecting requests for example.com to 192.168.1.100
Intercepted ${Math.floor(Math.random() * 20) + 5} DNS queries so far...
` : 
attackType === 'wps' ?
  `WPS attack in progress...
Testing PIN: ${Math.floor(Math.random() * 10000000) + 10000000}
Attempts: ${Math.floor(currentAttack.progress / 10) + 1}
`
: ''
}` : 
"No attack running. Output will appear here during an attack."
                        }
                      </pre>
                    </>
                  )}
                </ScrollArea>
              </div>
            )}

            {attackSessions.length > 0 && (
              <div className="w-full mt-4">
                <Label className="text-sm mb-2 block text-gray-300">
                  Attack History
                </Label>
                <div className="space-y-3">
                  {attackSessions.map((attack) => (
                    <Card 
                      key={attack.id} 
                      className={`bg-cyber-darker border-cyber-dark ${attack.status === 'running' ? 'border-yellow-500/50' : ''}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center">
                              <CardTitle className="font-medium text-base">
                                {attack.type.charAt(0).toUpperCase() + attack.type.slice(1)} Attack
                              </CardTitle>
                              <Badge 
                                className={`ml-2 ${
                                  attack.status === 'completed' 
                                    ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                                    : attack.status === 'running'
                                      ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
                                      : 'bg-red-900/30 text-red-400 border-red-500/50'
                                }`}
                              >
                                {attack.status.charAt(0).toUpperCase() + attack.status.slice(1)}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs mt-1">
                              Target: {attack.targetSSID} ({attack.targetBSSID})
                            </CardDescription>
                          </div>
                          <div className="text-xs text-gray-400">
                            {attack.startTime}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="py-2">
                        {attack.status === 'running' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <div>Progress: {Math.round(attack.progress)}%</div>
                            </div>
                            <Progress value={attack.progress} className="h-2" />
                          </div>
                        )}
                        
                        <div className="text-sm mb-2">
                          {attack.details}
                        </div>
                        
                        {attack.status === 'completed' && attack.results && (
                          <div className="mt-2 p-2 bg-cyber-dark/70 rounded text-xs font-mono">
                            <div className="text-gray-400 mb-1">Results:</div>
                            <div className="text-gray-200">{attack.results}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {attackSessions.length === 0 && !currentAttack && (
              <div className="w-full p-8 bg-cyber-darker border border-cyber-dark rounded-md text-center">
                <Network className="h-12 w-12 mx-auto text-gray-600 mb-3" />
                <h3 className="text-lg font-medium text-gray-400">No Attacks Performed</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Select a network from the scanner tab and configure an attack above.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WifiAnalyzerTool;

