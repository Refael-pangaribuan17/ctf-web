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

// Supported archive formats
const ARCHIVE_EXTENSIONS = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tgz', '.bz2', '.tbz2'];

// File type detection helper
const getFileType = (filename: string): 'image' | 'audio' | 'video' | 'text' | 'archive' | 'unknown' => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
  if (['.mp3', '.wav', '.ogg', '.flac', '.aac'].includes(ext)) return 'audio';
  if (['.mp4', '.webm', '.avi', '.mov', '.mkv'].includes(ext)) return 'video';
  if (['.txt', '.pdf', '.doc', '.docx', '.rtf', '.md', '.html', '.xml', '.json'].includes(ext)) return 'text';
  if (ARCHIVE_EXTENSIONS.includes(ext)) return 'archive';
  
  return 'unknown';
};

// FileTree component to display extracted archive contents
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
    
    // Update the parent component with all selected files
    const updatedSelectedFiles = {
      ...selectedFiles,
      [path]: selected
    };
    
    const selectedPaths = Object.entries(updatedSelectedFiles)
      .filter(([_, isSelected]) => isSelected)
      .map(([path]) => path);
    
    onSelectFiles(selectedPaths);
  };
  
  // Update the nodes with selection state
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
              // Expand all directories
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

// Main SteganographyTool component
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
  const [recursionDepth, setRecursionDepth] = useState(3); // Default max recursion depth
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Reset archive extraction states
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

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio' | 'video' | 'text' | 'archive') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Special handling for archive files
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
      
      // Reset previous archive states
      resetArchiveStates();
      
      // Create a File URL
      const fileUrl = URL.createObjectURL(file);
      setArchiveFile(fileUrl);
      
      // Simulate the archive extraction process
      simulateArchiveExtraction(file);
      return;
    }
    
    // For non-archive files, use the existing logic
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

  // Simulate archive extraction with progress
  const simulateArchiveExtraction = (file: File) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    // Randomly decide if the archive is encrypted for demo purposes
    const isEncrypted = Math.random() > 0.7; // 30% chance of being encrypted
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
  
  // Extract the archive content
  const extractArchive = (file: File, password?: string) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    setArchiveExtractionError(null);
    
    // Simulate extraction process with progress
    const totalSteps = 20;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        currentStep++;
        setExtractionProgress(Math.floor((currentStep / totalSteps) * 100));
      } else {
        clearInterval(progressInterval);
        
        // Simulate extraction completion
        setTimeout(() => {
          setIsExtracting(false);
          
          // If password is incorrect (simulate 30% chance for demo)
          if (password && Math.random() > 0.7) {
            setArchiveExtractionError("Incorrect password. Please try again.");
            toast({
              title: "Extraction Failed",
              description: "Incorrect password. Please try again.",
              variant: "destructive",
            });
            return;
          }
          
          // Generate mock file structure based on file name
          const mockFiles = generateMockFileStructure(file.name);\
          setExtractedFiles(mockFiles);\
          
          toast({\
            title: "Extraction Complete",\
            description: `Successfully extracted ${countFiles(mockFiles)} files from the archive.`,
          });
        }, 1000);
      }
    }, 200);
  };
  
  // Count total files in a file structure
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
  
  // Generate mock file structure for demo
  const generateMockFileStructure = (archiveName: string): FileNode[] => {
    // Base structure with some common CTF challenge patterns
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
    
    // Add some variation based on the archive name
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

  // Handle analysis of extracted files
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
    
    // Simulate processing time based on the number of files
    const processingTime = 1000 + (selectedExtractedFiles.length * 500);
    
    setTimeout(() => {
      // Generate mock analysis results for selected files
      const results: any[] = selectedExtractedFiles.map(filePath => {
        const fileName = filePath.split('/').pop() || '';
        const fileType = getFileType(fileName);
        
        // Different results based on file type and name
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
      
      // Add to history
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

  // Handle extraction with password
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

  // Handle extraction with brute force
  const handleBruteForceExtraction = () => {
    setIsExtracting(true);
    setExtractionProgress(0);
    setArchiveExtractionError(null);
    
    // Simulate brute force process with progress
    const totalSteps = 30; // More steps for brute force
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        currentStep++;
        setExtractionProgress(Math.floor((currentStep / totalSteps) * 100));
      } else {
        clearInterval(progressInterval);
        
        // Simulate extraction completion
        setTimeout(() => {
          setIsExtracting(false);
          
          // 70% chance of success for demo
          if (Math.random() > 0.3) {
            const fileInputElement = fileInputRef.current;
            if (fileInputElement && fileInputElement.files && fileInputElement.files.length > 0) {
              // Generate mock file structure
              const mockFiles = generateMockFileStructure(fileInputElement.files[0].name);
              setExtractedFiles(mockFiles);
              
              toast({
                title: "Brute Force Successful",
                description: `Password found: "p4ssw0rd123". Extracted ${countFiles(mockFiles)} files.`,
              });
            }
          } else {
            setArchiveExtractionError("Brute force failed. Could not find the correct password.");
            toast({
              title: "Brute Force Failed",
              description: "Could not find the correct password. Try with a specific password if you know it.",
              variant: "destructive",
            });
          }
        }, 1500);
      }
    }, 200);
  };

  // Reset all states
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

  // Download result
  const handleDownload = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = 'stego_result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detection methods
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
    
    // Simulating detection with a timeout
    setTimeout(() => {
      // Generate mock detection results based on method
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
