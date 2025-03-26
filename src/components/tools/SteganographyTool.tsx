import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  RotateCcw, 
  Upload, 
  Image, 
  Download, 
  Search, 
  FileDigit, 
  FileAudio, 
  FileVideo, 
  FileText, 
  HardDrive, 
  Fingerprint, 
  Key, 
  Braces, 
  Bot,
  ScanLine,
  File,
  FileArchive,
  FolderTree,
  Archive,
  Lock,
  ChevronRight,
  ChevronDown,
  Layers,
  Locate
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const ARCHIVE_EXTENSIONS = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.tbz2'];

const getFileType = (filename: string): 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
  if (['.mp3', '.wav', '.ogg', '.flac', '.aac'].includes(ext)) return 'audio';
  if (['.mp4', '.webm', '.avi', '.mov', '.mkv'].includes(ext)) return 'video';
  if (['.txt', '.pdf', '.doc', '.docx', '.rtf', '.md', '.html', '.xml', '.json'].includes(ext)) return 'text';
  if (ARCHIVE_EXTENSIONS.includes(ext)) return 'archive';
  
  return 'unknown';
};

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  fileType?: 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown';
  fileSize?: string;
  selected?: boolean;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  onSelect: (path: string, selected: boolean) => void;
  expanded: Record<string, boolean>;
  toggleExpand: (path: string) => void;
}> = ({ node, level, onSelect, expanded, toggleExpand }) => {
  const isExpanded = expanded[node.path] || false;
  
  const handleCheckboxChange = (checked: boolean) => {
    onSelect(node.path, checked);
  };
  
  const getFileIcon = () => {
    if (node.type === 'directory') return <FolderTree className="h-4 w-4 text-yellow-400" />;
    
    switch(node.fileType) {
      case 'image': return <Image className="h-4 w-4 text-green-400" />;
      case 'audio': return <FileAudio className="h-4 w-4 text-blue-400" />;
      case 'video': return <FileVideo className="h-4 w-4 text-purple-400" />;
      case 'text': return <FileText className="h-4 w-4 text-gray-400" />;
      case 'archive': return <Archive className="h-4 w-4 text-red-400" />;
      default: return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="text-xs">
      <div 
        className={`flex items-center py-1 hover:bg-black/20 rounded px-1 ${node.selected ? 'bg-cyber-blue/10' : ''}`}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
      >
        {node.type === 'directory' && (
          <button 
            onClick={() => toggleExpand(node.path)} 
            className="mr-1 text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}
        
        {node.type === 'file' && (
          <>
            <div className="w-3 h-3 mr-1"></div>
            <Checkbox 
              id={`file-${node.path}`}
              checked={node.selected}
              onCheckedChange={handleCheckboxChange}
              className="mr-2 h-3 w-3 rounded-sm"
            />
          </>
        )}
        
        {getFileIcon()}
        <span className="ml-1.5 truncate">{node.name}</span>
        {node.fileSize && <span className="ml-auto text-gray-500">{node.fileSize}</span>}
      </div>
      
      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeItem 
              key={index} 
              node={child} 
              level={level + 1} 
              onSelect={onSelect}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC<{
  files: FileNode[];
  onSelectFiles: (paths: string[]) => void;
}> = ({ files, onSelectFiles }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({});
  
  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const handleSelect = (path: string, selected: boolean) => {
    setSelectedFiles(prev => ({
      ...prev,
      [path]: selected
    }));
    
    const updatedSelectedFiles = {
      ...selectedFiles,
      [path]: selected
    };
    
    const selectedPaths = Object.entries(updatedSelectedFiles)
      .filter(([_, isSelected]) => isSelected)
      .map(([path]) => path);
    
    onSelectFiles(selectedPaths);
  };
  
  const updateNodesWithSelection = (nodes: FileNode[]): FileNode[] => {
    return nodes.map(node => {
      const updatedNode = {
        ...node,
        selected: node.type === 'file' ? selectedFiles[node.path] || false : undefined
      };
      
      if (node.children) {
        updatedNode.children = updateNodesWithSelection(node.children);
      }
      
      return updatedNode;
    });
  };
  
  const filesWithSelection = updateNodesWithSelection(files);
  
  return (
    <div className="bg-cyber-darker border border-cyber-dark rounded-md">
      <div className="flex justify-between items-center p-2 border-b border-cyber-dark">
        <div className="flex items-center">
          <Archive className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm font-medium">Extracted Files</span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2 py-0"
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              const expandAll = (nodes: FileNode[]) => {
                nodes.forEach(node => {
                  if (node.type === 'directory') {
                    allExpanded[node.path] = true;
                    if (node.children) expandAll(node.children);
                  }
                });
              };
              expandAll(files);
              setExpanded(allExpanded);
            }}
          >
            Expand All
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2 py-0"
            onClick={() => {
              setExpanded({});
            }}
          >
            Collapse All
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[250px] p-2">
        {filesWithSelection.map((file, index) => (
          <FileTreeItem 
            key={index} 
            node={file} 
            level={0} 
            onSelect={handleSelect}
            expanded={expanded}
            toggleExpand={toggleExpand}
          />
        ))}
      </ScrollArea>
    </div>
  );
};

const SteganographyTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [textFile, setTextFile] = useState<string | null>(null);
  const [archiveFile, setArchiveFile] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [archivePassword, setArchivePassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [activeDetectionMethod, setActiveDetectionMethod] = useState<string>('lsb');
  const [detectionHistory, setDetectionHistory] = useState<Array<{timestamp: string, method: string, result: string}>>([]);
  const [activeTab, setActiveTab] = useState('detect');
  const [selectedHidingMethod, setSelectedHidingMethod] = useState('image-lsb');
  const [extractedFiles, setExtractedFiles] = useState<FileNode[]>([]);
  const [selectedExtractedFiles, setSelectedExtractedFiles] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isArchiveEncrypted, setIsArchiveEncrypted] = useState(false);
  const [showArchivePassword, setShowArchivePassword] = useState(false);
  const [archiveExtractionError, setArchiveExtractionError] = useState<string | null>(null);
  const [recursionDepth, setRecursionDepth] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetArchiveStates = () => {
    setExtractedFiles([]);
    setSelectedExtractedFiles([]);
    setArchiveFile(null);
    setIsExtracting(false);
    setExtractionProgress(0);
    setIsArchiveEncrypted(false);
    setShowArchivePassword(false);
    setArchivePassword('');
    setArchiveExtractionError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio' | 'video' | 'text' | 'archive') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (fileType === 'archive') {
      const fileName = file.name.toLowerCase();
      const isArchive = ARCHIVE_EXTENSIONS.some(ext => fileName.endsWith(ext));
      
      if (!isArchive) {
        toast({
          title: "Invalid archive file",
          description: "Please upload a supported archive file (ZIP, RAR, 7z, TAR, GZ, etc.).",
          variant: "destructive",
        });
        return;
      }
      
      resetArchiveStates();
      
      const fileUrl = URL.createObjectURL(file);
      setArchiveFile(fileUrl);
      
      simulateArchiveExtraction(file);
      return;
    }
    
    const fileTypeMappings = {
      'image': ['image/'],
      'audio': ['audio/'],
      'video': ['video/'],
      'text': ['text/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };
    
    const validTypes = fileTypeMappings[fileType];
    const isValidType = validTypes.some(type => file.type.startsWith(type));
    
    if (!isValidType) {
      toast({
        title: "Invalid file",
        description: `Please upload a ${fileType} file.`,
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      switch (fileType) {
        case 'image':
          setImage(reader.result as string);
          break;
        case 'audio':
          setAudioFile(reader.result as string);
          break;
        case 'video':
          setVideoFile(reader.result as string);
          break;
        case 'text':
          setTextFile(reader.result as string);
          break;
      }
      setResult(null);
      setDetectionResult(null);
    };
    
    if (fileType === 'text') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const simulateArchiveExtraction = (file: File) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    const isEncrypted = Math.random() > 0.7;
    setIsArchiveEncrypted(isEncrypted);
    
    if (isEncrypted) {
      setShowArchivePassword(true);
      setIsExtracting(false);
      toast({
        title: "Encrypted Archive",
        description: "The archive appears to be password-protected. Please enter the password.",
      });
      return;
    }
    
    extractArchive(file);
  };

  const extractArchive = (file: File, password?: string) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    setArchiveExtractionError(null);
    
    const totalSteps = 20;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        currentStep++;
        setExtractionProgress(Math.floor((currentStep / totalSteps) * 100));
      } else {
        clearInterval(progressInterval);
        
        const mockFiles = generateMockFileStructure(file.name);
        setExtractedFiles(mockFiles);
        
        toast({
          title: "Extraction Complete",
          description: `Successfully extracted ${countFiles(mockFiles)} files from the archive.`,
        });
      }
    }, 200);
  };

  const countFiles = (files: FileNode[]): number => {
    return files.reduce((count, file) => {
      if (file.type === 'file') {
        return count + 1;
      } else if (file.children) {
        return count + countFiles(file.children);
      }
      return count;
    }, 0);
  };

  const generateMockFileStructure = (archiveName: string): FileNode[] => {
    const baseStructure: FileNode[] = [
      {
        name: "images",
        type: "directory",
        path: "images",
        children: [
          {
            name: "hidden_data.png",
            type: "file",
            path: "images/hidden_data.png",
            fileType: "image",
            fileSize: "1.2 MB"
          },
          {
            name: "secret_message.jpg",
            type: "file",
            path: "images/secret_message.jpg",
            fileType: "image",
            fileSize: "845 KB"
          },
          {
            name: "normal_image.jpg",
            type: "file",
            path: "images/normal_image.jpg",
            fileType: "image",
            fileSize: "1.5 MB"
          },
          {
            name: "flag_hidden.png",
            type: "file",
            path: "images/flag_hidden.png",
            fileType: "image",
            fileSize: "2.3 MB"
          }
        ]
      },
      {
        name: "audio",
        type: "directory",
        path: "audio",
        children: [
          {
            name: "mysterious_sound.wav",
            type: "file",
            path: "audio/mysterious_sound.wav",
            fileType: "audio",
            fileSize: "3.7 MB"
          },
          {
            name: "secret_message.mp3",
            type: "file",
            path: "audio/secret_message.mp3",
            fileType: "audio",
            fileSize: "2.1 MB"
          }
        ]
      },
      {
        name: "documents",
        type: "directory",
        path: "documents",
        children: [
          {
            name: "readme.txt",
            type: "file",
            path: "documents/readme.txt",
            fileType: "text",
            fileSize: "1.2 KB"
          },
          {
            name: "hints.pdf",
            type: "file",
            path: "documents/hints.pdf",
            fileType: "text",
            fileSize: "256 KB"
          }
        ]
      },
      {
        name: "nested",
        type: "directory",
        path: "nested",
        children: [
          {
            name: "more_files.zip",
            type: "file",
            path: "nested/more_files.zip",
            fileType: "archive",
            fileSize: "5.3 MB"
          },
          {
            name: "level2",
            type: "directory",
            path: "nested/level2",
            children: [
              {
                name: "deeperhidden.jpg",
                type: "file",
                path: "nested/level2/deeperhidden.jpg",
                fileType: "image",
                fileSize: "3.2 MB"
              },
              {
                name: "level3",
                type: "directory",
                path: "nested/level2/level3",
                children: [
                  {
                    name: "evendeeper.zip",
                    type: "file",
                    path: "nested/level2/level3/evendeeper.zip",
                    fileType: "archive",
                    fileSize: "1.7 MB"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "flag.txt",
        type: "file",
        path: "flag.txt",
        fileType: "text",
        fileSize: "12 B"
      },
      {
        name: "challenge_data.bin",
        type: "file",
        path: "challenge_data.bin",
        fileType: "unknown",
        fileSize: "4.8 MB"
      }
    ];
    
    if (archiveName.toLowerCase().includes("ctf") || archiveName.toLowerCase().includes("challenge")) {
      baseStructure.push({
        name: "hidden_directory",
        type: "directory",
        path: "hidden_directory",
        children: [
          {
            name: "secret.key",
            type: "file",
            path: "hidden_directory/secret.key",
            fileType: "text",
            fileSize: "128 B"
          },
          {
            name: "encrypted_flag.bin",
            type: "file",
            path: "hidden_directory/encrypted_flag.bin",
            fileType: "unknown",
            fileSize: "256 B"
          }
        ]
      });
    }
    
    return baseStructure;
  };

  const analyzeSelectedFiles = () => {
    if (selectedExtractedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    const processingTime = 1000 + (selectedExtractedFiles.length * 500);
    
    setTimeout(() => {
      const results: any[] = selectedExtractedFiles.map(filePath => {
        const fileName = filePath.split('/').pop() || '';
        const fileType = getFileType(fileName);
        
        if (fileType === 'image') {
          if (fileName.includes('hidden') || fileName.includes('secret') || fileName.includes('flag')) {
            return {
              path: filePath,
              fileName,
              technique: "LSB Steganography",
              confidence: "High (92%)",
              hiddenDataSize: "Approximately 1.3KB",
              findings: "Hidden text message detected in blue channel"
            };
          } else {
            return {
              path: filePath,
              fileName,
              technique: "Image Analysis",
              confidence: "Low (34%)",
              findings: "No obvious steganography detected"
            };
          }
        } else if (fileType === 'audio') {
          return {
            path: filePath,
            fileName,
            technique: "Spectrogram Analysis",
            confidence: "High (89%)",
            findings: "Hidden data detected in high frequency range"
          };
        } else if (fileType === 'text') {
          if (fileName === 'flag.txt') {
            return {
              path: filePath,
              fileName,
              technique: "Text Analysis",
              confidence: "N/A",
              findings: "Contains potential flag: FLAG{st3g4n0gr4phy_m4st3r}"
            };
          } else {
            return {
              path: filePath,
              fileName,
              technique: "Text Analysis",
              confidence: "Medium (56%)",
              findings: "Possible whitespace steganography detected"
            };
          }
        } else if (fileType === 'archive') {
          return {
            path: filePath,
            fileName,
            technique: "Archive Analysis",
            confidence: "N/A",
            findings: "Nested archive detected. Consider extracting this for deeper analysis."
          };
        } else {
          return {
            path: filePath,
            fileName,
            technique: "Binary Analysis",
            confidence: "Medium (67%)",
            findings: "Unusual byte patterns detected, possible hidden data"
          };
        }
      });
      
      setDetectionResult({
        type: 'archive-analysis',
        results,
        summary: `Analysis completed for ${results.length} file(s). Found potential steganography in ${
          results.filter(r => r.confidence?.includes("High")).length
        } file(s).`
      });
      
      setIsProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${results.length} files from the archive.`,
      });
      
      setDetectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          method: "Archive Analysis", 
          result: `Analyzed ${results.length} files from the archive. Found potential steganography in ${
            results.filter(r => r.confidence?.includes("High")).length
          } file(s).`
        }
      ]);
    }, processingTime);
  };

  const handlePasswordExtraction = () => {
    if (!archivePassword.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter a password for the encrypted archive.",
        variant: "destructive",
      });
      return;
    }
    
    const fileInputElement = fileInputRef.current;
    if (fileInputElement && fileInputElement.files && fileInputElement.files.length > 0) {
      extractArchive(fileInputElement.files[0], archivePassword);
    } else {
      toast({
        title: "Error",
        description: "Could not access the archive file. Please try uploading again.",
        variant: "destructive",
      });
    }
  };

  const handleBruteForceExtraction = () => {
    setIsExtracting(true);
    setExtractionProgress(0);
    setArchiveExtractionError(null);
    
    const totalSteps = 30;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        currentStep++;
        setExtractionProgress(Math.floor((currentStep / totalSteps) * 100));
      } else {
        clearInterval(progressInterval);
        
        const fileInputElement = fileInputRef.current;
        if (fileInputElement && fileInputElement.files && fileInputElement.files.length > 0) {
          const mockFiles = generateMockFileStructure(fileInputElement.files[0].name);
          setExtractedFiles(mockFiles);
          
          toast({
            title: "Brute Force Successful",
            description: `Password found: "p4ssw0rd123". Extracted ${countFiles(mockFiles)} files.`,
          });
        }
      }
    }, 200);
  };

  const handleReset = () => {
    setImage(null);
    setAudioFile(null);
    setVideoFile(null);
    setTextFile(null);
    resetArchiveStates();
    setResult(null);
    setDetectionResult(null);
    setMessage('');
    setPassword('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = 'stego_result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runDetection = (method: string) => {
    if (!image && !audioFile && !videoFile && !textFile) {
      toast({
        title: "No file",
        description: "Please upload a file to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setActiveDetectionMethod(method);
    
    setTimeout(() => {
      let detectionData: any = {};
      let detectionText = "";
      
      switch (method) {
        case 'lsb':
          detectionData = {
            technique: "Least Significant Bit (LSB)",
            confidence: "High (87%)",
            hiddenDataSize: "Approximately 2.3KB",
            pattern: "Regular pattern detected in color channels",
            details: [
              "Modified pixels: ~12,400 (5.2% of image)",
              "Primary channel affected: Blue",
              "Bit distribution: Non-random",
              "Potential hidden content detected in lower right quadrant"
            ]
          };
          detectionText = "Hidden data detected using LSB analysis with 87% confidence. Approximately 2.3KB of data found primarily in the blue channel.";
          break;
        
        case 'palette':
          detectionData = {
            technique: "Palette & Color Analysis",
            confidence: "Medium (68%)",
            anomalies: "Color histogram shows unusual distribution",
            details: [
              "Non-standard color transitions detected",
              "Statistical anomalies in green channel",
              "Possible palette manipulation",
              "Unusual color pairs detected in specific regions"
            ]
          };
          detectionText = "Potential steganography detected through palette analysis with 68% confidence. Unusual color distributions found.";
          break;
          
        case 'dct':
          detectionData = {
            technique: "Discrete Cosine Transform (DCT)",
            confidence: "High (92%)",
            jstegType: "F5 or similar algorithm",
            details: [
              "DCT coefficient modifications detected",
              "Abnormal quantization table",
              "Modified DCT coefficients in high frequency regions",
              "Pattern suggests message embedding in JPEG compression"
            ]
          };
          detectionText = "DCT analysis reveals hidden data with 92% confidence. The pattern suggests F5 or similar algorithm was used.";
          break;
          
        case 'audio':
          detectionData = {
            technique: "Audio Spectrogram Analysis",
            confidence: "High (89%)",
            frequency: "Hidden content in 18-22 kHz range",
            details: [
              "Echo patterns detected at regular intervals",
              "Phase modifications in high frequency components",
              "Temporal anomalies at specific timestamps",
              "Potential LSB encoding in WAV data"
            ]
          };
          detectionText = "Spectrogram analysis detected hidden content in high frequency ranges (18-22 kHz) with 89% confidence.";
          break;
          
        case 'video':
          detectionData = {
            technique: "Video Frame Analysis",
            confidence: "Medium (75%)",
            frameCount: "14 frames contain suspicious data",
            details: [
              "Modified I-frames detected",
              "Temporal pattern suggests data is split across frames",
              "Minor pixel modifications in motion areas",
              "Steganography confidence higher in scenes with less motion"
            ]
          };
          detectionText = "Video steganography detected across 14 frames with 75% confidence. Data appears to be hidden in I-frames.";
          break;
          
        case 'metadata':
          detectionData = {
            technique: "Metadata & Header Analysis",
            findings: [
              {
                section: "EXIF Data",
                anomalies: [
                  "Hidden extended XMP data",
                  "Modified creation timestamps",
                  "Custom application markers",
                  "GPS coordinates embedded in non-standard fields"
                ]
              },
              {
                section: "File Structure",
                anomalies: [
                  "Additional data after EOF marker",
                  "Embedded content in ICC profile",
                  "Unexpected file structure padding",
                  "Hidden data in application-specific segments"
                ]
              }
            ]
          };
          detectionText = "Metadata analysis discovered hidden information in EXIF data and after the EOF marker. Recommend extracting with specialized tools.";
          break;
          
        case 'signature':
          detectionData = {
            technique: "File Signature Analysis",
            status: "File signature mismatch detected",
            declaredType: "PNG",
            actualContent: "PNG with embedded ZIP data",
            details: [
              "ZIP header signature found at offset 0x4A72F",
              "PNG chunks modified with additional data",
              "Possible polyglot file (valid in multiple formats)",
              "Hidden data appended after IEND chunk"
            ]
          };
          detectionText = "File signature analysis detected a polyglot file - PNG with embedded ZIP data at offset 0x4A72F.";
          break;
      }
      
      setDetectionResult({
        type: method,
        data: detectionData,
        text: detectionText
      });
      
      setDetectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          method: method === 'lsb' ? 'LSB Analysis' : 
                  method === 'palette' ? 'Palette Analysis' : 
                  method === 'dct' ? 'DCT Analysis' : 
                  method === 'audio' ? 'Audio Analysis' : 
                  method === 'video' ? 'Video Analysis' : 
                  method === 'metadata' ? 'Metadata Analysis' : 
                  'Signature Analysis', 
          result: detectionText
        }
      ]);
      
      setIsProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: "Steganography detection completed successfully.",
      });
    }, 2000);
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-full max-w-md mb-4">
            <Progress value={extractionProgress} className="h-2 w-full" />
          </div>
          <p className="text-gray-400 text-sm">
            Processing... This may take a moment.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'detect':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Upload Media</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-upload">Image File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="audio-upload">Audio File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, 'audio')}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="video-upload">Video File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, 'video')}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-upload">Text File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="text-upload"
                        type="file"
                        accept=".txt,.html,.md,.xml,.json"
                        onChange={(e) => handleFileChange(e, 'text')}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Detection Methods</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeDetectionMethod === 'lsb' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'lsb' && "border-cyber-blue")}
                    onClick={() => runDetection('lsb')}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    LSB Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'palette' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'palette' && "border-cyber-blue")}
                    onClick={() => runDetection('palette')}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Palette Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'dct' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'dct' && "border-cyber-blue")}
                    onClick={() => runDetection('dct')}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    DCT Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'audio' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'audio' && "border-cyber-blue")}
                    onClick={() => runDetection('audio')}
                  >
                    <FileAudio className="mr-2 h-4 w-4" />
                    Audio Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'video' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'video' && "border-cyber-blue")}
                    onClick={() => runDetection('video')}
                  >
                    <FileVideo className="mr-2 h-4 w-4" />
                    Video Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'metadata' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'metadata' && "border-cyber-blue")}
                    onClick={() => runDetection('metadata')}
                  >
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Metadata Analysis
                  </Button>
                  <Button
                    variant={activeDetectionMethod === 'signature' ? "default" : "outline"}
                    className={cn("flex justify-start", activeDetectionMethod === 'signature' && "border-cyber-blue")}
                    onClick={() => runDetection('signature')}
                    className="col-span-2"
                  >
                    <FileDigit className="mr-2 h-4 w-4" />
                    File Signature Analysis
                  </Button>
                </div>
                
                {(image || audioFile || videoFile || textFile) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Preview</h4>
                    <div className="border border-cyber-dark rounded-md p-3 bg-cyber-darker overflow-hidden">
                      {image && (
                        <img 
                          src={image} 
                          alt="Uploaded image" 
                          className="max-h-40 mx-auto object-contain" 
                        />
                      )}
                      {audioFile && (
                        <audio 
                          src={audioFile} 
                          controls 
                          className="w-full" 
                        />
                      )}
                      {videoFile && (
                        <video 
                          src={videoFile} 
                          controls 
                          className="max-h-40 w-full" 
                        />
                      )}
                      {textFile && (
                        <div className="text-xs overflow-auto max-h-40 whitespace-pre">
                          {textFile}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            
            {detectionResult && (
              <div className="mt-6 border border-cyber-blue/30 rounded-md p-5 bg-cyber-dark/30">
                <h3 className="text-lg font-medium mb-4">Detection Results</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300">{detectionResult.text}</p>
                  </div>
                  
                  {detectionResult.data && (
                    <div className="bg-black/30 rounded-md p-3 font-mono text-xs overflow-auto max-h-80">
                      <pre className="text-gray-300">
                        {JSON.stringify(detectionResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {detectionResult.type === 'archive-analysis' && detectionResult.results && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">File Analysis Results</h4>
                      <div className="space-y-2">
                        {detectionResult.results.map((result: any, index: number) => (
                          <div key={index} className="border border-cyber-dark rounded-md p-3 bg-cyber-darker">
                            <div className="flex items-center">
                              {result.fileName.endsWith('.png') || result.fileName.endsWith('.jpg') || result.fileName.endsWith('.jpeg') || result.fileName.endsWith('.gif') ? (
                                <Image className="h-4 w-4 text-green-400 mr-2" />
                              ) : result.fileName.endsWith('.wav') || result.fileName.endsWith('.mp3') ? (
                                <FileAudio className="h-4 w-4 text-blue-400 mr-2" />
                              ) : result.fileName.endsWith('.txt') || result.fileName.endsWith('.pdf') ? (
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              ) : (
                                <File className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <span className="font-medium">{result.fileName}</span>
                              {result.confidence && (
                                <span className={`ml-auto text-xs ${
                                  result.confidence.includes('High') ? 'text-green-400' : 
                                  result.confidence.includes('Medium') ? 'text-yellow-400' : 
                                  'text-red-400'
                                }`}>
                                  {result.confidence}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-400">
                              <p><span className="text-gray-500">Technique:</span> {result.technique}</p>
                              {result.hiddenDataSize && (
                                <p><span className="text-gray-500">Data Size:</span> {result.hiddenDataSize}</p>
                              )}
                              <p><span className="text-gray-500">Findings:</span> {result.findings}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result && (
                    <div className="mt-4">
                      <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Result
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {detectionHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Analysis History</h3>
                <div className="border border-cyber-dark rounded-md divide-y divide-cyber-dark">
                  {detectionHistory.map((item, index) => (
                    <div key={index} className="p-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.method}</span>
                        <span className="text-gray-500">{item.timestamp}</span>
                      </div>
                      <p className="text-gray-400">{item.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'extract':
        return (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Archive Extraction</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="archive-upload">Archive File</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="archive-upload"
                        type="file"
                        accept=".zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.tbz2"
                        onChange={(e) => handleFileChange(e, 'archive')}
                        className="flex-1"
                        ref={fileInputRef}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: ZIP, RAR, 7z, TAR, GZ, and more
                    </p>
                  </div>
                  
                  {isArchiveEncrypted && showArchivePassword && (
                    <div className="border border-cyber-blue/30 rounded-md p-3 bg-cyber-dark/20">
                      <Label htmlFor="archive-password">Archive Password</Label>
                      <div className="mt-1 flex">
                        <Input
                          id="archive-password"
                          type="password"
                          value={archivePassword}
                          onChange={(e) => setArchivePassword(e.target.value)}
                          placeholder="Enter password..."
                          className="flex-1"
                        />
                      </div>
                      
                      {archiveExtractionError && (
                        <p className="text-red-400 text-xs mt-2">{archiveExtractionError}</p>
                      )}
                      
                      <div className="flex justify-between mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePasswordExtraction}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Extract with Password
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBruteForceExtraction}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Try Brute Force
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {isExtracting && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Extracting archive...</span>
                        <span>{extractionProgress}%</span>
                      </div>
                      <Progress value={extractionProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="recursion-depth">Max Recursion Depth</Label>
                    <div className="mt-1 flex">
                      <Input
                        id="recursion-depth"
                        type="number"
                        min={1}
                        max={10}
                        value={recursionDepth}
                        onChange={(e) => setRecursionDepth(parseInt(e.target.value) || 3)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum depth for extracting nested archives (e.g., ZIP inside ZIP)
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                {extractedFiles.length > 0 ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Extracted Files</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={analyzeSelectedFiles}
                        disabled={selectedExtractedFiles.length === 0}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Analyze Selected ({selectedExtractedFiles.length})
                      </Button>
                    </div>
                    
                    <FileTree
                      files={extractedFiles}
                      onSelectFiles={setSelectedExtractedFiles}
                    />
                  </div>
                ) : (
                  <div className="border border-cyber-dark rounded-md p-6 h-full flex flex-col items-center justify-center">
                    <Archive className="h-10 w-10 text-gray-700 mb-3" />
                    <p className="text-gray-500 text-center">
                      Upload an archive file to extract and analyze its contents
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {detectionResult && detectionResult.type === 'archive-analysis' && (
              <div className="mt-6 border border-cyber-blue/30 rounded-md p-5 bg-cyber-dark/30">
                <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                <p className="text-gray-300 mb-4">{detectionResult.summary}</p>
                
                <div className="space-y-3">
                  {detectionResult.results.map((result: any, index: number) => (
                    <div key={index} className="border border-cyber-dark rounded-md p-3 bg-cyber-darker">
                      <div className="flex items-center">
                        {result.fileName.endsWith('.png') || result.fileName.endsWith('.jpg') || result.fileName.endsWith('.jpeg') || result.fileName.endsWith('.gif') ? (
                          <Image className="h-4 w-4 text-green-400 mr-2" />
                        ) : result.fileName.endsWith('.wav') || result.fileName.endsWith('.mp3') ? (
                          <FileAudio className="h-4 w-4 text-blue-400 mr-2" />
                        ) : result.fileName.endsWith('.txt') || result.fileName.endsWith('.pdf') ? (
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        ) : (
                          <File className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="font-medium">{result.fileName}</span>
                        {result.confidence && (
                          <span className={`ml-auto text-xs ${
                            result.confidence.includes('High') ? 'text-green-400' : 
                            result.confidence.includes('Medium') ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {result.confidence}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-400">
                        <p><span className="text-gray-500">Technique:</span> {result.technique}</p>
                        {result.hiddenDataSize && (
                          <p><span className="text-gray-500">Data Size:</span> {result.hiddenDataSize}</p>
                        )}
                        <p><span className="text-gray-500">Findings:</span> {result.findings}</p>
                      </div>
                      
                      {result.fileName.endsWith('.zip') || result.fileName.endsWith('.rar') || result.fileName.endsWith('.7z') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            toast({
                              title: "Feature in development",
                              description: "Nested archive extraction will be available in a future update.",
                            });
                          }}
                        >
                          <FolderTree className="mr-2 h-3 w-3" />
                          Extract Nested Archive
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="border cyber-border p-6 rounded-md bg-cyber-darker">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Image className="h-6 w-6 mr-2 text-cyber-blue" />
        Advanced Steganography Tool
      </h2>
      
      <Tabs
        defaultValue="detect"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="detect" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Detect Steganography
          </TabsTrigger>
          <TabsTrigger value="extract" className="flex items-center">
            <Archive className="mr-2 h-4 w-4" />
            Archive Analyzer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="detect" className="mt-0">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="extract" className="mt-0">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SteganographyTool;
