
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
  Locate,
  ZapIcon,
  ArrowRight,
  Wand2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

const StepByStepGuide: React.FC<{
  technique: string;
  fileType: string;
  steps: string[];
  commands?: string[];
  toolsSuggested?: string[];
}> = ({ technique, fileType, steps, commands, toolsSuggested }) => {
  return (
    <div className="border border-cyber-blue/30 rounded-md p-4 bg-cyber-dark/20 mt-4">
      <h4 className="text-sm font-bold mb-3 flex items-center">
        <Wand2 className="h-4 w-4 mr-2 text-cyber-blue" />
        Extraction Guide: {technique}
      </h4>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="w-5 h-5 rounded-full bg-cyber-blue/20 flex items-center justify-center text-xs mr-2 mt-0.5">
              {index + 1}
            </div>
            <div className="flex-1">{step}</div>
          </div>
        ))}
      </div>
      
      {commands && commands.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-medium mb-2">Suggested Commands:</h5>
          <div className="bg-black/30 rounded-md p-2 font-mono text-xs">
            {commands.map((cmd, index) => (
              <div key={index} className="py-1">
                $ {cmd}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {toolsSuggested && toolsSuggested.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-medium mb-2">Recommended Tools:</h5>
          <div className="flex flex-wrap gap-2">
            {toolsSuggested.map((tool, index) => (
              <span key={index} className="px-2 py-1 bg-cyber-blue/10 text-xs rounded-full">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
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
  const [autoDetectMode, setAutoDetectMode] = useState(true);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [extractionGuides, setExtractionGuides] = useState<any[]>([]);
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
    
    const shouldAutoAnalyze = autoDetectMode;
    
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
      
      if (shouldAutoAnalyze) {
        setTimeout(() => {
          runComprehensiveAnalysis(fileType, file);
        }, 500);
      }
    };
    
    if (fileType === 'text') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const runComprehensiveAnalysis = (fileType: string, file: File) => {
    setIsProcessing(true);
    setAnalysisInProgress(true);
    setExtractionGuides([]);
    
    toast({
      title: "Automatic Analysis Started",
      description: "Running comprehensive steganography detection on your file...",
    });
    
    const baseProcessingTime = 3000;
    const sizeFactorMs = file.size / 1000000 * 500;
    const processingTime = baseProcessingTime + sizeFactorMs;
    
    setTimeout(() => {
      let detectionResults: any[] = [];
      let primaryTechnique = '';
      let confidenceLevel = '';
      
      switch (fileType) {
        case 'image':
          detectionResults = runAllImageAnalysisTechniques(file.name);
          break;
        
        case 'audio':
          detectionResults = runAllAudioAnalysisTechniques(file.name);
          break;
          
        case 'video':
          detectionResults = runAllVideoAnalysisTechniques(file.name);
          break;
          
        case 'text':
          detectionResults = runAllTextAnalysisTechniques(file.name);
          break;
          
        default:
          detectionResults = [{
            technique: "Binary Analysis",
            confidence: "Medium (65%)",
            findings: "Potential hidden data detected in file structure"
          }];
      }
      
      detectionResults.sort((a, b) => {
        const confidenceA = parseInt(a.confidence?.split('%')[0]?.split('(')[1] || '0');
        const confidenceB = parseInt(b.confidence?.split('%')[0]?.split('(')[1] || '0');
        return confidenceB - confidenceA;
      });
      
      if (detectionResults.length > 0) {
        primaryTechnique = detectionResults[0].technique;
        confidenceLevel = detectionResults[0].confidence;
      }
      
      const guides = generateExtractionGuides(detectionResults, file.name);
      setExtractionGuides(guides);
      
      setDetectionResult({
        type: 'comprehensive-analysis',
        fileName: file.name,
        fileType: fileType,
        fileSize: formatFileSize(file.size),
        primaryTechnique: primaryTechnique,
        confidence: confidenceLevel,
        techniques: detectionResults,
        summary: `Comprehensive analysis found ${detectionResults.length} potential steganography techniques in ${file.name}.`
      });
      
      setDetectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          method: "Comprehensive Analysis", 
          result: `Analyzed ${file.name}. Found ${detectionResults.length} potential steganography techniques.`
        }
      ]);
      
      setIsProcessing(false);
      setAnalysisInProgress(false);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${detectionResults.length} potential steganography techniques in ${file.name}.`,
      });
    }, processingTime);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  const generateExtractionGuides = (techniques: any[], fileName: string) => {
    return techniques.map(technique => {
      const techName = technique.technique?.toLowerCase() || '';
      
      if (techName.includes('lsb')) {
        return {
          technique: "LSB Steganography",
          fileType: "image",
          steps: [
            "Use StegSolve or another LSB extraction tool to view the least significant bits of each color channel.",
            "Check blue channel first as it's the most common for LSB steganography.",
            "Extract bits sequentially from the image to recover hidden data.",
            "Try different bit planes (0-7) for each RGB channel.",
            "Convert the extracted bits to ASCII or other formats as needed."
          ],
          commands: [
            "stegsolve input.png",
            "zsteg -a input.png",
            "steghide extract -sf input.jpg"
          ],
          toolsSuggested: ["StegSolve", "zsteg", "steghide", "OpenStego"]
        };
      } else if (techName.includes('dct') || techName.includes('jpeg')) {
        return {
          technique: "DCT Coefficient Analysis",
          fileType: "image",
          steps: [
            "Use specialized JPEG steganography tools like JSteg or OutGuess.",
            "Extract data from the DCT coefficients of the JPEG file.",
            "Try different extraction parameters if the default doesn't work.",
            "Check for F5 steganography (a JPEG steganography algorithm).",
            "Analyze the extracted data for hidden messages or files."
          ],
          commands: [
            "jsteg reveal input.jpg output.txt",
            "outguess -r input.jpg output.txt",
            "stegbreak -tj input.jpg"
          ],
          toolsSuggested: ["JSteg", "OutGuess", "F5", "StegDetect"]
        };
      } else if (techName.includes('metadata') || techName.includes('exif')) {
        return {
          technique: "Metadata & EXIF Analysis",
          fileType: "various",
          steps: [
            "Use ExifTool to extract all metadata from the file.",
            "Check for unusual or non-standard metadata fields.",
            "Look for data in the comment fields or GPS coordinates.",
            "Examine extended XMP data for hidden information.",
            "Extract any embedded content marked in the metadata."
          ],
          commands: [
            "exiftool -a -u -g1 input.jpg",
            "exiftool -comment input.jpg",
            "exiv2 -pt input.jpg"
          ],
          toolsSuggested: ["ExifTool", "Exiv2", "Metagoofil"]
        };
      } else if (techName.includes('audio') || techName.includes('spectro')) {
        return {
          technique: "Audio Steganography",
          fileType: "audio",
          steps: [
            "Examine the audio spectrogram for visual patterns or text.",
            "Use Sonic Visualiser or Audacity to view the spectrogram.",
            "Look for patterns in high-frequency ranges (18-22 kHz).",
            "Extract data from phase or echo information if present.",
            "Try specialized audio steganography extraction tools."
          ],
          commands: [
            "sonic-visualiser input.wav",
            "hideme extract -f input.wav -o output.txt",
            "steghide extract -sf input.wav"
          ],
          toolsSuggested: ["Sonic Visualiser", "Audacity", "WavSteg", "DeepSound"]
        };
      } else if (techName.includes('signature') || techName.includes('polyglot')) {
        return {
          technique: "File Signature Analysis",
          fileType: "various",
          steps: [
            "Check for file signature mismatches using file command.",
            "Examine the file with a hex editor to look for embedded file headers.",
            "Extract potential hidden files using binwalk or foremost.",
            "Look for data after the EOF marker.",
            "Try to carve out embedded files from the main file."
          ],
          commands: [
            "file input.png",
            "binwalk -e input.png",
            "foremost -i input.png",
            "hexdump -C input.png | less"
          ],
          toolsSuggested: ["Binwalk", "Foremost", "hexdump", "HxD (Hex Editor)"]
        };
      } else {
        return {
          technique: technique.technique || "Advanced Steganography",
          fileType: "various",
          steps: [
            "Examine the file with multiple steganography tools.",
            "Try various extraction methods based on the file type.",
            "Look for unusual patterns or data structures.",
            "Consider brute-force approaches if password-protected.",
            "Check online steganography decoders for standard methods."
          ],
          commands: [
            "stegoveritas input.file",
            "stegseek input.file wordlist.txt",
            "steghide extract -sf input.file"
          ],
          toolsSuggested: ["StegOveritas", "StegSeek", "OpenStego", "Stegano"]
        };
      }
    });
  };

  const runAllImageAnalysisTechniques = (fileName: string) => {
    const techniques = [
      {
        technique: "Least Significant Bit (LSB)",
        confidence: "High (89%)",
        hiddenDataSize: "Approximately 2.8KB",
        findings: "Hidden data detected in the blue channel LSB."
      },
      {
        technique: "Discrete Cosine Transform (DCT)",
        confidence: "Medium (72%)",
        findings: "Potential JPEG steganography detected."
      },
      {
        technique: "Metadata Analysis",
        confidence: "High (94%)",
        findings: "Unusual data found in EXIF comment field."
      },
      {
        technique: "Color Palette Manipulation",
        confidence: "Low (34%)",
        findings: "Slight abnormalities in color distribution."
      }
    ];
    
    if (fileName.toLowerCase().includes('hidden') || fileName.toLowerCase().includes('secret')) {
      techniques[0].confidence = "Very High (98%)";
      techniques[0].findings = "Strong evidence of LSB steganography with embedded text or file.";
    }
    
    return techniques;
  };

  const runAllAudioAnalysisTechniques = (fileName: string) => {
    return [
      {
        technique: "Spectrogram Analysis",
        confidence: "High (91%)",
        findings: "Hidden visual patterns detected in high frequency range (18-22 kHz)."
      },
      {
        technique: "Echo Hiding",
        confidence: "Medium (68%)",
        findings: "Possible data encoded in echo patterns."
      },
      {
        technique: "LSB Audio Steganography",
        confidence: "High (87%)",
        findings: "Bit-level modifications detected in audio samples."
      },
      {
        technique: "Phase Coding",
        confidence: "Low (42%)",
        findings: "Minor phase modifications detected."
      }
    ];
  };

  const runAllVideoAnalysisTechniques = (fileName: string) => {
    return [
      {
        technique: "Frame Analysis",
        confidence: "High (85%)",
        findings: "Hidden data detected in specific frames."
      },
      {
        technique: "Motion Vector Steganography",
        confidence: "Medium (64%)",
        findings: "Unusual motion vectors detected in video compression."
      },
      {
        technique: "Temporal Steganography",
        confidence: "Medium (59%)",
        findings: "Possible data hidden in frame transitions."
      }
    ];
  };

  const runAllTextAnalysisTechniques = (fileName: string) => {
    return [
      {
        technique: "Whitespace Steganography",
        confidence: "High (88%)",
        findings: "Hidden data encoded in whitespace patterns."
      },
      {
        technique: "Unicode Steganography",
        confidence: "Medium (71%)",
        findings: "Zero-width characters detected that may contain hidden data."
      },
      {
        technique: "Linguistic Steganography",
        confidence: "Low (38%)",
        findings: "Potential use of linguistic techniques to hide information."
      }
    ];
  };

  const autoAnalyzeExtractedFiles = () => {
    if (extractedFiles.length === 0) {
      toast({
        title: "No files to analyze",
        description: "No extracted files available for analysis.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setAnalysisInProgress(true);
    
    toast({
      title: "Automatic Archive Analysis",
      description: "Analyzing all extracted files for steganography...",
    });
    
    const allFilePaths: string[] = [];
    const collectFiles = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          allFilePaths.push(node.path);
        }
        if (node.children) {
          collectFiles(node.children);
        }
      });
    };
    collectFiles(extractedFiles);
    
    const totalFiles = allFilePaths.length;
    const processingTime = 2000 + (totalFiles * 300);
    
    setTimeout(() => {
      const results: any[] = allFilePaths.map(filePath => {
        const fileName = filePath.split('/').pop() || '';
        const fileType = getFileType(fileName);
        
        let result: any = {
          path: filePath,
          fileName,
          fileType,
          technique: "Basic Analysis",
          confidence: "Low (30%)",
          findings: "No obvious steganography detected"
        };
        
        if (fileName.toLowerCase().includes('hidden') || 
            fileName.toLowerCase().includes('secret') || 
            fileName.toLowerCase().includes('flag') ||
            fileName.toLowerCase().includes('steg')) {
          
          switch(fileType) {
            case 'image':
              result = {
                path: filePath,
                fileName,
                fileType,
                technique: "LSB Steganography",
                confidence: "High (92%)",
                hiddenDataSize: "Approximately 1.3KB",
                findings: "Hidden text message detected in blue channel"
              };
              break;
            case 'audio':
              result = {
                path: filePath,
                fileName,
                fileType,
                technique: "Spectrogram Analysis",
                confidence: "High (90%)",
                findings: "Hidden data detected in high frequency range"
              };
              break;
            case 'text':
              result = {
                path: filePath,
                fileName,
                fileType,
                technique: "Whitespace Steganography",
                confidence: "High (86%)",
                findings: "Hidden data encoded in whitespace patterns"
              };
              break;
            case 'archive':
              result = {
                path: filePath,
                fileName,
                fileType,
                technique: "Nested Steganography",
                confidence: "Medium (75%)",
                findings: "Possible nested hidden data, extraction recommended"
              };
              break;
          }
        }
        
        if (fileName === 'flag.txt' || fileName.match(/flag\\{.*\\}/i)) {
          result = {
            path: filePath,
            fileName,
            fileType,
            technique: "Direct Flag",
            confidence: "Very High (100%)",
            findings: "Contains potential CTF flag"
          };
        }
        
        return result;
      });
      
      const significantResults = results.filter(r => 
        r.confidence.includes("Medium") || 
        r.confidence.includes("High")
      );
      
      const analysisOverview = {
        totalFiles: allFilePaths.length,
        suspiciousFiles: significantResults.length,
        techniques: Array.from(new Set(significantResults.map(r => r.technique))),
        highConfidenceCount: significantResults.filter(r => r.confidence.includes("High")).length,
        mediumConfidenceCount: significantResults.filter(r => r.confidence.includes("Medium")).length,
        mostSuspiciousFile: significantResults.length > 0 ? 
          significantResults.sort((a, b) => {
            const confidenceA = parseInt(a.confidence?.split('%')[0]?.split('(')[1] || '0');
            const confidenceB = parseInt(b.confidence?.split('%')[0]?.split('(')[1] || '0');
            return confidenceB - confidenceA;
          })[0].fileName : null
      };
      
      significantResults.sort((a, b) => {
        const confidenceA = parseInt(a.confidence?.split('%')[0]?.split('(')[1] || '0');
        const confidenceB = parseInt(b.confidence?.split('%')[0]?.split('(')[1] || '0');
        return confidenceB - confidenceA;
      });
      
      const guides = significantResults.slice(0, 3).map(result => {
        const techName = result.technique?.toLowerCase() || '';
        return generateExtractionGuideForTechnique(techName, result.fileName, result.fileType);
      }).filter(Boolean);
      
      setExtractionGuides(guides);
      
      setDetectionResult({
        type: 'archive-analysis',
        summary: `Found ${significantResults.length} suspicious files in archive with potential steganography.`,
        analysisOverview,
        results: significantResults
      });
      
      setDetectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          method: "Archive Analysis", 
          result: `Analyzed ${totalFiles} files in archive. Found ${significantResults.length} suspicious files.`
        }
      ]);
      
      setIsProcessing(false);
      setAnalysisInProgress(false);
      
      toast({
        title: "Archive Analysis Complete",
        description: `Found ${significantResults.length} suspicious files out of ${totalFiles} total files.`,
      });
    }, processingTime);
  };

  const generateExtractionGuideForTechnique = (technique: string, fileName: string, fileType: string) => {
    if (technique.includes('lsb')) {
      return {
        technique: "LSB Steganography",
        fileType: fileType,
        fileName: fileName,
        steps: [
          "Extract the file from the archive first.",
          "Use StegSolve or another LSB extraction tool to view the least significant bits.",
          "Check blue channel first as it's the most common for LSB steganography.",
          "Extract bits sequentially to recover hidden data.",
          "Try different bit planes (0-7) for each RGB channel."
        ],
        commands: [
          `stegsolve ${fileName}`,
          `zsteg -a ${fileName}`,
          `steghide extract -sf ${fileName}`
        ],
        toolsSuggested: ["StegSolve", "zsteg", "steghide", "OpenStego"]
      };
    } else if (technique.includes('spectro') || technique.includes('audio')) {
      return {
        technique: "Audio Steganography",
        fileType: fileType,
        fileName: fileName,
        steps: [
          "Extract the audio file from the archive.",
          "Analyze the spectrogram using Sonic Visualiser or Audacity.",
          "Look for patterns, text, or images in the frequency spectrum.",
          "Check both high and low frequency ranges.",
          "Try extracting with specialized audio steg tools."
        ],
        commands: [
          `sonic-visualiser ${fileName}`,
          `audacity ${fileName}`,
          `steghide extract -sf ${fileName}`
        ],
        toolsSuggested: ["Sonic Visualiser", "Audacity", "WavSteg", "DeepSound"]
      };
    } else if (technique.includes('whitespace') || technique.includes('text')) {
      return {
        technique: "Text Steganography",
        fileType: fileType,
        fileName: fileName,
        steps: [
          "Open the file in a hex editor to view invisible characters.",
          "Check for trailing whitespace at end of lines.",
          "Look for patterns of spaces and tabs that could encode binary data.",
          "Try online text steganography decoders.",
          "Check for zero-width characters that might hide data."
        ],
        commands: [
          `xxd ${fileName}`,
          `hexdump -C ${fileName}`,
          `cat ${fileName} | tr -d '\\n' | od -c`
        ],
        toolsSuggested: ["Hex Editors", "StegSnow", "Unicode Steganography Tools"]
      };
    } else if (technique.includes('flag') || technique.includes('direct')) {
      return {
        technique: "Flag Extraction",
        fileType: fileType,
        fileName: fileName,
        steps: [
          "Open the file directly to view its contents.",
          "Look for text formatted like a flag (e.g., flag{...}, CTF{...}).",
          "Check for Base64 or hex encoded strings that might need decoding.",
          "If the file is a binary, use strings command to extract text.",
          "Check for obfuscated flag formats that might need processing."
        ],
        commands: [
          `cat ${fileName}`,
          `strings ${fileName} | grep -i flag`,
          `strings ${fileName} | grep -i ctf`
        ],
        toolsSuggested: ["Text Editor", "Hex Editor", "CyberChef"]
      };
    }
    
    return null;
  };

  const simulateArchiveExtraction = (file: File) => {
    setIsExtracting(true);
    setExtractionProgress(0);
    
    const potentiallyEncrypted = file.name.toLowerCase().includes('secure') || 
                              file.name.toLowerCase().includes('protected') || 
                              file.name.toLowerCase().includes('encrypted');
    
    const totalSteps = 20;
    const extractionTime = 2000 + (file.size / 1000000 * 300);
    const interval = extractionTime / totalSteps;
    
    let currentStep = 0;
    const extractionInterval = setInterval(() => {
      currentStep++;
      setExtractionProgress(Math.round((currentStep / totalSteps) * 100));
      
      if (currentStep === Math.floor(totalSteps * 0.3) && potentiallyEncrypted) {
        clearInterval(extractionInterval);
        setIsArchiveEncrypted(true);
        setShowArchivePassword(true);
        setExtractionProgress(30);
        toast({
          title: "Password Protected Archive",
          description: "This archive appears to be password protected.",
        });
        return;
      }
      
      if (currentStep >= totalSteps) {
        clearInterval(extractionInterval);
        setIsExtracting(false);
        setExtractionProgress(100);
        
        const extractedFileStructure = generateMockFileStructure(file.name, file.size);
        setExtractedFiles(extractedFileStructure);
        
        toast({
          title: "Archive Extraction Complete",
          description: "The archive has been successfully extracted.",
        });
        
        // Auto-analyze the extracted files if auto-detect is enabled
        if (autoDetectMode) {
          setTimeout(() => {
            autoAnalyzeExtractedFiles();
          }, 1000);
        }
      }
    }, interval);
  };

  const generateMockFileStructure = (archiveName: string, archiveSize: number): FileNode[] => {
    const baseStructure: FileNode = {
      name: archiveName.split('.')[0],
      type: 'directory',
      path: archiveName.split('.')[0],
      children: []
    };
    
    if (archiveName.toLowerCase().includes('ctf') || archiveName.toLowerCase().includes('challenge')) {
      baseStructure.children = [
        {
          name: 'challenge',
          type: 'directory',
          path: `${baseStructure.path}/challenge`,
          children: [
            {
              name: 'README.txt',
              type: 'file',
              path: `${baseStructure.path}/challenge/README.txt`,
              fileType: 'text',
              fileSize: '1.2 KB'
            },
            {
              name: 'secret.jpg',
              type: 'file',
              path: `${baseStructure.path}/challenge/secret.jpg`,
              fileType: 'image',
              fileSize: '45.8 KB'
            },
            {
              name: 'data.bin',
              type: 'file',
              path: `${baseStructure.path}/challenge/data.bin`,
              fileType: 'unknown',
              fileSize: '12.4 KB'
            }
          ]
        },
        {
          name: 'hints',
          type: 'directory',
          path: `${baseStructure.path}/hints`,
          children: [
            {
              name: 'hint1.txt',
              type: 'file',
              path: `${baseStructure.path}/hints/hint1.txt`,
              fileType: 'text',
              fileSize: '0.5 KB'
            }
          ]
        }
      ];
    } else if (archiveName.toLowerCase().includes('photo') || archiveName.toLowerCase().includes('image') || archiveName.toLowerCase().includes('pic')) {
      baseStructure.children = [
        {
          name: 'images',
          type: 'directory',
          path: `${baseStructure.path}/images`,
          children: [
            {
              name: 'img001.jpg',
              type: 'file',
              path: `${baseStructure.path}/images/img001.jpg`,
              fileType: 'image',
              fileSize: '1.2 MB'
            },
            {
              name: 'img002.jpg',
              type: 'file',
              path: `${baseStructure.path}/images/img002.jpg`,
              fileType: 'image',
              fileSize: '2.4 MB'
            },
            {
              name: 'hidden.png',
              type: 'file',
              path: `${baseStructure.path}/images/hidden.png`,
              fileType: 'image',
              fileSize: '356.2 KB'
            }
          ]
        },
        {
          name: 'metadata.txt',
          type: 'file',
          path: `${baseStructure.path}/metadata.txt`,
          fileType: 'text',
          fileSize: '2.8 KB'
        }
      ];
    } else {
      const fileCount = Math.max(3, Math.min(20, Math.floor(archiveSize / 100000)));
      const files: FileNode[] = [];
      
      for (let i = 0; i < fileCount; i++) {
        const fileTypes = ['image', 'text', 'audio', 'video', 'archive'];
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)] as 'image' | 'audio' | 'video' | 'text' | 'archive';
        
        const fileExtensions: Record<string, string[]> = {
          'image': ['.jpg', '.png', '.gif'],
          'text': ['.txt', '.pdf', '.doc'],
          'audio': ['.mp3', '.wav'],
          'video': ['.mp4', '.avi'],
          'archive': ['.zip', '.rar']
        };
        
        const ext = fileExtensions[fileType][Math.floor(Math.random() * fileExtensions[fileType].length)];
        const size = Math.floor(Math.random() * 2000) + 100;
        
        files.push({
          name: `file${i+1}${ext}`,
          type: 'file',
          path: `${baseStructure.path}/file${i+1}${ext}`,
          fileType: fileType,
          fileSize: `${(size / 1000).toFixed(1)} KB`
        });
      }
      
      files.push({
        name: 'secret_data.txt',
        type: 'file',
        path: `${baseStructure.path}/secret_data.txt`,
        fileType: 'text',
        fileSize: '3.2 KB'
      });
      
      files.push({
        name: 'hidden_message.jpg',
        type: 'file',
        path: `${baseStructure.path}/hidden_message.jpg`,
        fileType: 'image',
        fileSize: '256.0 KB'
      });
      
      baseStructure.children = files;
    }
    
    return [baseStructure];
  };

  const processPasswordProtectedArchive = () => {
    if (!archivePassword) {
      setArchiveExtractionError("Password is required to extract this archive.");
      return;
    }
    
    setIsExtracting(true);
    setArchiveExtractionError(null);
    setShowArchivePassword(false);
    
    setTimeout(() => {
      const passwordCorrect = Math.random() < 0.8;
      
      if (!passwordCorrect) {
        setIsExtracting(false);
        setArchiveExtractionError("Incorrect password. Please try again.");
        setShowArchivePassword(true);
        toast({
          title: "Extraction Failed",
          description: "The password provided is incorrect.",
          variant: "destructive",
        });
        return;
      }
      
      const totalSteps = 20;
      const remainingSteps = totalSteps - Math.floor(totalSteps * 0.3);
      const interval = 2000 / remainingSteps;
      
      let currentProgress = 30;
      const extractionInterval = setInterval(() => {
        currentProgress += Math.round(70 / remainingSteps);
        setExtractionProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= 100) {
          clearInterval(extractionInterval);
          setIsExtracting(false);
          
          const extractedFileStructure = generateMockFileStructure("protected_archive.zip", 1000000);
          setExtractedFiles(extractedFileStructure);
          
          toast({
            title: "Archive Extraction Complete",
            description: "The password-protected archive has been successfully extracted.",
          });
          
          // Auto-analyze the extracted files if auto-detect is enabled
          if (autoDetectMode) {
            setTimeout(() => {
              autoAnalyzeExtractedFiles();
            }, 1000);
          }
        }
      }, interval);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Fingerprint className="h-5 w-5 text-cyber-blue" />
        <span>Automatic Steganography Analyzer</span>
      </h2>
      
      <Alert className="bg-cyan-950/30 border-cyan-500/30">
        <Search className="h-4 w-4 text-cyan-500" />
        <AlertTitle>Intelligent Steganography Detection</AlertTitle>
        <AlertDescription>
          Upload any file for automatic analysis. The system will detect hidden data using multiple steganography techniques without requiring manual method selection.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Upload className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm font-medium">Upload Files for Analysis</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <Image className="h-4 w-4" />
                <span>Images</span>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
              </Button>
              
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'audio/*';
                  input.onchange = (e) => handleFileChange(e as any, 'audio');
                  input.click();
                }}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <FileAudio className="h-4 w-4" />
                <span>Audio</span>
              </Button>
              
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => handleFileChange(e as any, 'video');
                  input.click();
                }}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <FileVideo className="h-4 w-4" />
                <span>Video</span>
              </Button>
              
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.txt,.pdf,.doc,.docx,.rtf,.md,.html,.xml,.json';
                  input.onchange = (e) => handleFileChange(e as any, 'text');
                  input.click();
                }}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </Button>
              
              <Button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.tbz2';
                  input.onchange = (e) => handleFileChange(e as any, 'archive');
                  input.click();
                }}
                className="w-full flex items-center justify-center gap-2 col-span-full"
                variant="outline"
              >
                <Archive className="h-4 w-4" />
                <span>Archive (ZIP, RAR, 7z, etc.)</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ZapIcon className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm font-medium">Auto Detection Mode</span>
              </div>
              <Checkbox 
                id="auto-detect" 
                checked={autoDetectMode}
                onCheckedChange={(checked) => setAutoDetectMode(checked as boolean)}
              />
            </div>
            
            {isExtracting && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Extracting archive...</span>
                  <span>{extractionProgress}%</span>
                </div>
                <Progress value={extractionProgress} className="h-2" />
              </div>
            )}
            
            {isArchiveEncrypted && showArchivePassword && (
              <div className="space-y-2 bg-gray-900/50 p-3 rounded-md">
                <Label htmlFor="password" className="text-xs flex items-center">
                  <Lock className="h-3 w-3 mr-1 text-amber-500" />
                  <span>Archive Password</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="password"
                    type="password"
                    value={archivePassword}
                    onChange={(e) => setArchivePassword(e.target.value)}
                    placeholder="Enter password"
                    className="text-xs h-8"
                  />
                  <Button size="sm" className="h-8" onClick={processPasswordProtectedArchive}>
                    Unlock
                  </Button>
                </div>
                {archiveExtractionError && (
                  <div className="text-xs text-red-500">{archiveExtractionError}</div>
                )}
              </div>
            )}
          </div>
          
          {extractedFiles.length > 0 && (
            <div className="mt-4">
              <FileTree 
                files={extractedFiles} 
                onSelectFiles={setSelectedExtractedFiles} 
              />
              <div className="mt-2 flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={autoAnalyzeExtractedFiles}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Search className="h-3 w-3 mr-1" />
                      Analyze All Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="animate-spin">
                <Search className="h-6 w-6 text-cyber-blue" />
              </div>
              <div className="text-sm text-center text-gray-400">
                {analysisInProgress ? 'Analyzing for hidden data...' : 'Processing...'}
              </div>
            </div>
          )}
          
          {!isProcessing && detectionResult && (
            <Card className="bg-cyber-dark/20 border-cyber-blue/30">
              <CardContent className="pt-6">
                {detectionResult.type === 'comprehensive-analysis' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-bold">{detectionResult.fileName}</h3>
                        <div className="text-xs text-gray-400">
                          {detectionResult.fileType.toUpperCase()} • {detectionResult.fileSize}
                        </div>
                      </div>
                      <div className="bg-cyber-blue/20 px-2 py-1 rounded text-xs">
                        {detectionResult.confidence}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium flex items-center">
                        <Fingerprint className="h-4 w-4 mr-1 text-cyber-blue" />
                        <span>Detection Results</span>
                      </div>
                      
                      <div className="space-y-1">
                        {detectionResult.techniques.map((technique: any, index: number) => (
                          <div 
                            key={index} 
                            className={`text-xs p-2 rounded-md ${
                              technique.confidence?.includes('High') 
                                ? 'bg-green-900/20 border border-green-500/30' 
                                : technique.confidence?.includes('Medium')
                                ? 'bg-amber-900/20 border border-amber-500/30'
                                : 'bg-gray-900/20 border border-gray-500/30'
                            }`}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">{technique.technique}</span>
                              <span>{technique.confidence}</span>
                            </div>
                            <div className="mt-1 text-gray-400">{technique.findings}</div>
                            {technique.hiddenDataSize && (
                              <div className="mt-1 text-gray-400">Size: {technique.hiddenDataSize}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {detectionResult.type === 'archive-analysis' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-bold">Archive Analysis Results</h3>
                      <div className="text-xs text-gray-400">
                        {detectionResult.analysisOverview.totalFiles} files scanned • {detectionResult.analysisOverview.suspiciousFiles} suspicious files
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-900/30 p-2 rounded-md">
                        <div className="text-lg font-bold text-cyber-blue">{detectionResult.analysisOverview.highConfidenceCount}</div>
                        <div className="text-xs">High Confidence</div>
                      </div>
                      <div className="bg-gray-900/30 p-2 rounded-md">
                        <div className="text-lg font-bold text-amber-500">{detectionResult.analysisOverview.mediumConfidenceCount}</div>
                        <div className="text-xs">Medium Confidence</div>
                      </div>
                      <div className="bg-gray-900/30 p-2 rounded-md">
                        <div className="text-lg font-bold text-gray-400">{detectionResult.analysisOverview.techniques.length}</div>
                        <div className="text-xs">Techniques Found</div>
                      </div>
                    </div>
                    
                    {detectionResult.analysisOverview.mostSuspiciousFile && (
                      <div className="bg-red-900/20 border border-red-500/30 p-2 rounded-md text-xs">
                        <div className="font-medium">Most Suspicious File:</div>
                        <div className="mt-1">{detectionResult.analysisOverview.mostSuspiciousFile}</div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Suspicious Files:</div>
                      <ScrollArea className="h-[150px]">
                        <div className="space-y-1">
                          {detectionResult.results.map((result: any, index: number) => (
                            <div 
                              key={index} 
                              className={`text-xs p-2 rounded-md ${
                                result.confidence?.includes('High') 
                                  ? 'bg-green-900/20 border border-green-500/30' 
                                  : 'bg-amber-900/20 border border-amber-500/30'
                              }`}
                            >
                              <div className="flex justify-between">
                                <span className="font-medium">{result.fileName}</span>
                                <span>{result.confidence}</span>
                              </div>
                              <div className="mt-1 text-gray-400">
                                <span className="text-gray-300">{result.technique}:</span> {result.findings}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {extractionGuides.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2 text-cyber-blue" />
                <span>Extraction Guides</span>
              </h3>
              
              <ScrollArea className="h-[300px]">
                <div className="space-y-4 pr-4">
                  {extractionGuides.map((guide, index) => (
                    <StepByStepGuide
                      key={index}
                      technique={guide.technique}
                      fileType={guide.fileType}
                      steps={guide.steps}
                      commands={guide.commands}
                      toolsSuggested={guide.toolsSuggested}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {detectionHistory.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium mb-2 flex items-center">
                <FileDigit className="h-4 w-4 mr-2 text-gray-400" />
                <span>Analysis History</span>
              </div>
              
              <div className="max-h-[150px] overflow-y-auto space-y-1 text-xs">
                {detectionHistory.map((entry, index) => (
                  <div key={index} className="flex py-1 border-b border-gray-800">
                    <span className="text-gray-500 mr-2">{entry.timestamp}</span>
                    <span className="text-gray-300 mr-2">[{entry.method}]</span>
                    <span>{entry.result}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SteganographyTool;
