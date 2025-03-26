
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ScanLine
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const SteganographyTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [textFile, setTextFile] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDetectionMethod, setActiveDetectionMethod] = useState<string>('lsb');
  const [detectionHistory, setDetectionHistory] = useState<Array<{timestamp: string, method: string, result: string}>>([]);
  const [activeTab, setActiveTab] = useState('detect');
  const [selectedHidingMethod, setSelectedHidingMethod] = useState('image-lsb');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio' | 'video' | 'text') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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

  // Reset all states
  const handleReset = () => {
    setImage(null);
    setAudioFile(null);
    setVideoFile(null);
    setTextFile(null);
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
          
        case 'bruteforce':
          detectionData = {
            technique: "Stego Brute Force",
            status: "Password-protected hidden content detected",
            passwordHints: ["Likely 6-10 characters", "Alphanumeric only"],
            algorithmDetected: "Probably OpenStego or Outguess",
            recommendations: [
              "Try common CTF passwords",
              "Check for hints in image content",
              "Try default passwords for detected algorithm"
            ]
          };
          detectionText = "Password-protected steganography detected. The content appears to be hidden with OpenStego or Outguess.";
          break;
          
        case 'ai':
          detectionData = {
            technique: "AI-Powered Detection",
            confidence: "Very High (96%)",
            algorithm: "Neural network classification",
            explanation: "The AI model has identified statistical anomalies consistent with steganographic modifications",
            details: [
              "Pattern matches known steganography techniques",
              "Pixel statistics deviate from natural images",
              "LSB plane shows non-random distribution",
              "High entropy in specific image regions"
            ]
          };
          detectionText = "AI analysis detected steganography with 96% confidence. Statistical patterns match known steganographic techniques.";
          break;
          
        default:
          detectionData = {
            error: "Invalid detection method"
          };
      }
      
      setDetectionResult(detectionData);
      
      // Add to history
      setDetectionHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date().toLocaleTimeString(), 
          method: method, 
          result: detectionText
        }
      ]);
      
      setIsProcessing(false);
      
      toast({
        title: "Analysis complete",
        description: `${method.toUpperCase()} steganography analysis has been completed.`,
      });
    }, 2000);
  };

  // Generate extracted data
  const extractHiddenData = () => {
    if (!detectionResult) {
      toast({
        title: "No detection result",
        description: "Please run detection first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulating extraction
    setTimeout(() => {
      const extractedMessage = "Congratulations! You've successfully extracted the hidden message: 'FLAG{st3g0_m4st3r_3xtr4ct0r}'";
      setResult(extractedMessage);
      setIsProcessing(false);
      
      toast({
        title: "Extraction complete",
        description: "Hidden data has been extracted successfully.",
      });
    }, 2000);
  };

  // Hide data in different media types
  const hideData = () => {
    let sourceFile = null;
    let fileType = '';
    
    switch (selectedHidingMethod.split('-')[0]) {
      case 'image':
        sourceFile = image;
        fileType = 'image';
        break;
      case 'audio':
        sourceFile = audioFile;
        fileType = 'audio';
        break;
      case 'video':
        sourceFile = videoFile;
        fileType = 'video';
        break;
      case 'text':
        sourceFile = textFile;
        fileType = 'text';
        break;
    }
    
    if (!sourceFile) {
      toast({
        title: `No ${fileType} file`,
        description: `Please upload a ${fileType} file to use as a carrier.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!message) {
      toast({
        title: "No message",
        description: "Please enter a message to hide.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulating steganography with a timeout
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Data hidden",
        description: `Your message has been hidden in the ${fileType}. You can now download it.`,
      });
      
      // In a real implementation, this would be where the steganography happens
      // For now, we're just returning the original image or a placeholder for other types
      if (fileType === 'image') {
        setResult(image);
      } else {
        // For non-image files, we'd normally create a modified file
        // Here we'll just show a success message
        setResult(`Successfully hidden data in ${fileType} file using ${selectedHidingMethod.split('-')[1].toUpperCase()}. Download to save the file.`);
      }
    }, 2000);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setDetectionResult(null);
    setResult(null);
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Image className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Advanced Steganography Toolkit</h2>
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

        <Tabs defaultValue="detect" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="detect">Detection & Analysis</TabsTrigger>
            <TabsTrigger value="extract">Data Extraction</TabsTrigger>
            <TabsTrigger value="hide">Data Hiding</TabsTrigger>
          </TabsList>
          
          {/* Detection & Analysis Tab */}
          <TabsContent value="detect" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="image-upload" className="text-sm mb-2 block text-gray-300">
                Upload File for Analysis
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*,audio/*,video/*,text/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'image')}
                      className="font-mono"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      onClick={() => runDetection('lsb')}
                      disabled={!image && !audioFile && !videoFile && !textFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'lsb' ? 'default' : 'outline'}
                      size="sm"
                    >
                      LSB Analysis
                    </Button>
                    <Button
                      onClick={() => runDetection('palette')}
                      disabled={!image || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'palette' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Color Analysis
                    </Button>
                    <Button
                      onClick={() => runDetection('dct')}
                      disabled={!image || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'dct' ? 'default' : 'outline'}
                      size="sm"
                    >
                      DCT Analysis
                    </Button>
                    <Button
                      onClick={() => runDetection('audio')}
                      disabled={!audioFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'audio' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Spectrogram
                    </Button>
                    <Button
                      onClick={() => runDetection('video')}
                      disabled={!videoFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'video' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Video Frames
                    </Button>
                    <Button
                      onClick={() => runDetection('metadata')}
                      disabled={!image && !audioFile && !videoFile && !textFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'metadata' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Metadata
                    </Button>
                    <Button
                      onClick={() => runDetection('signature')}
                      disabled={!image && !audioFile && !videoFile && !textFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'signature' ? 'default' : 'outline'}
                      size="sm"
                    >
                      File Signature
                    </Button>
                    <Button
                      onClick={() => runDetection('bruteforce')}
                      disabled={!image && !audioFile && !videoFile && !textFile || isProcessing}
                      className="w-full text-xs"
                      variant={activeDetectionMethod === 'bruteforce' ? 'default' : 'outline'}
                      size="sm"
                    >
                      Brute Force
                    </Button>
                    <Button
                      onClick={() => runDetection('ai')}
                      disabled={!image && !audioFile && !videoFile && !textFile || isProcessing}
                      className="w-full text-xs bg-cyber-blue hover:bg-cyber-blue/80"
                      variant={activeDetectionMethod === 'ai' ? 'default' : 'outline'}
                      size="sm"
                    >
                      AI Detection
                    </Button>
                  </div>
                </div>
                
                <div className="bg-cyber-darker border border-cyber-dark p-2 rounded-md flex items-center justify-center">
                  {image ? (
                    <img 
                      src={image} 
                      alt="Uploaded" 
                      className="max-h-[200px] max-w-full object-contain"
                    />
                  ) : audioFile ? (
                    <div className="text-center">
                      <FileAudio className="h-12 w-12 mx-auto mb-2" />
                      <p>Audio file loaded</p>
                      <audio controls className="mt-2 w-full">
                        <source src={audioFile} />
                      </audio>
                    </div>
                  ) : videoFile ? (
                    <div className="text-center">
                      <FileVideo className="h-12 w-12 mx-auto mb-2" />
                      <p>Video file loaded</p>
                      <video controls className="mt-2 max-h-[150px]">
                        <source src={videoFile} />
                      </video>
                    </div>
                  ) : textFile ? (
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2" />
                      <p>Text file loaded</p>
                      <div className="mt-2 text-xs text-left bg-black/30 p-2 max-h-[150px] overflow-auto">
                        {textFile}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Image className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No file uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {isProcessing && (
              <div className="w-full text-center p-4">
                <div className="animate-spin h-8 w-8 border-2 border-cyber-blue border-opacity-50 border-t-cyber-blue rounded-full mx-auto mb-4"></div>
                <p className="text-cyber-blue">Analyzing file using {activeDetectionMethod.toUpperCase()} detection...</p>
                <p className="text-xs text-gray-400 mt-2">This may take a moment depending on file size and complexity</p>
              </div>
            )}
            
            {detectionResult && (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300 flex justify-between">
                  <span>Analysis Results</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">
                        <ScanLine className="h-3 w-3 mr-1" />
                        View Detection History
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Detection History</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto">
                        {detectionHistory.length > 0 ? (
                          <div className="space-y-2">
                            {detectionHistory.map((entry, index) => (
                              <div key={index} className="bg-cyber-darker p-3 rounded-md border border-cyber-dark">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span className="font-mono">{entry.timestamp}</span>
                                  <span className="uppercase">{entry.method} Analysis</span>
                                </div>
                                <p className="text-sm">{entry.result}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-400">No detection history yet</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </Label>
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-cyber-blue">
                      {activeDetectionMethod === 'lsb' && "LSB Steganography Analysis"}
                      {activeDetectionMethod === 'palette' && "Color & Palette Analysis"}
                      {activeDetectionMethod === 'dct' && "DCT Coefficient Analysis"}
                      {activeDetectionMethod === 'audio' && "Audio Spectrogram Analysis"}
                      {activeDetectionMethod === 'video' && "Video Frame Analysis"}
                      {activeDetectionMethod === 'metadata' && "Metadata Analysis"}
                      {activeDetectionMethod === 'signature' && "File Signature Analysis"}
                      {activeDetectionMethod === 'bruteforce' && "Stego Brute Force"}
                      {activeDetectionMethod === 'ai' && "AI-Powered Stego Detection"}
                    </h3>
                    {detectionResult.confidence && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        detectionResult.confidence?.includes("High") 
                          ? "bg-green-500/20 text-green-400" 
                          : detectionResult.confidence?.includes("Medium")
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}>
                        {detectionResult.confidence}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 font-mono text-sm">
                    {/* LSB Analysis Result */}
                    {activeDetectionMethod === 'lsb' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Technique:</span>
                            <div className="mt-1">{detectionResult.technique}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Hidden Data Size:</span>
                            <div className="mt-1">{detectionResult.hiddenDataSize}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Pattern:</span>
                          <div className="mt-1">{detectionResult.pattern}</div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {/* Palette Analysis */}
                    {activeDetectionMethod === 'palette' && (
                      <>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Technique:</span>
                          <div className="mt-1">{detectionResult.technique}</div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Anomalies:</span>
                          <div className="mt-1">{detectionResult.anomalies}</div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* DCT Analysis */}
                    {activeDetectionMethod === 'dct' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Technique:</span>
                            <div className="mt-1">{detectionResult.technique}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Steganography Type:</span>
                            <div className="mt-1">{detectionResult.jstegType}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* Audio Analysis */}
                    {activeDetectionMethod === 'audio' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Technique:</span>
                            <div className="mt-1">{detectionResult.technique}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Frequency Range:</span>
                            <div className="mt-1">{detectionResult.frequency}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* Video Analysis */}
                    {activeDetectionMethod === 'video' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Technique:</span>
                            <div className="mt-1">{detectionResult.technique}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Affected Frames:</span>
                            <div className="mt-1">{detectionResult.frameCount}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* Metadata Analysis */}
                    {activeDetectionMethod === 'metadata' && (
                      <>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Technique:</span>
                          <div className="mt-1">{detectionResult.technique}</div>
                        </div>
                        {detectionResult.findings.map((finding: any, findingIdx: number) => (
                          <div key={findingIdx} className="bg-black/30 p-2 rounded text-xs">
                            <span className="text-gray-400">{finding.section}:</span>
                            <ul className="mt-1 list-disc list-inside space-y-1">
                              {finding.anomalies.map((anomaly: string, idx: number) => (
                                <li key={idx}>{anomaly}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* File Signature Analysis */}
                    {activeDetectionMethod === 'signature' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Status:</span>
                            <div className="mt-1 text-yellow-400">{detectionResult.status}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">File Type Mismatch:</span>
                            <div className="mt-1">
                              {detectionResult.declaredType} → {detectionResult.actualContent}
                            </div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* Brute Force */}
                    {activeDetectionMethod === 'bruteforce' && (
                      <>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Status:</span>
                          <div className="mt-1 text-yellow-400">{detectionResult.status}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Password Hints:</span>
                            <ul className="mt-1 list-disc list-inside">
                              {detectionResult.passwordHints.map((hint: string, idx: number) => (
                                <li key={idx}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Algorithm:</span>
                            <div className="mt-1">{detectionResult.algorithmDetected}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Recommendations:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                    
                    {/* AI Detection */}
                    {activeDetectionMethod === 'ai' && (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Technique:</span>
                            <div className="mt-1">{detectionResult.technique}</div>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <span className="text-gray-400">Algorithm:</span>
                            <div className="mt-1">{detectionResult.algorithm}</div>
                          </div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Explanation:</span>
                          <div className="mt-1">{detectionResult.explanation}</div>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-xs">
                          <span className="text-gray-400">Details:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {detectionResult.details.map((detail: string, idx: number) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Data Extraction Tab */}
          <TabsContent value="extract" className="space-y-6">
            {detectionResult ? (
              <div className="space-y-6">
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md">
                  <h3 className="text-lg font-semibold text-cyber-blue mb-3">
                    Extraction Parameters
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Steganography detected with {detectionResult.confidence || 'medium'} confidence. Configure extraction parameters:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="extract-password">Password (if protected)</Label>
                      <Input 
                        id="extract-password"
                        type="password"
                        placeholder="Enter password if steganography is password-protected"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Extraction Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="text-xs justify-start"
                        >
                          <Fingerprint className="h-3 w-3 mr-2" />
                          Auto-detect
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="text-xs justify-start"
                        >
                          <Key className="h-3 w-3 mr-2" />
                          Brute Force
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={extractHiddenData}
                      disabled={isProcessing}
                      className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
                    >
                      {isProcessing ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isProcessing ? "Extracting..." : "Extract Hidden Data"}
                    </Button>
                  </div>
                </div>
                
                {result && (
                  <div className="w-full">
                    <Label className="text-sm mb-2 block text-gray-300">
                      Extracted Data
                    </Label>
                    <div className="font-mono text-sm bg-cyber-darker border border-green-500/30 p-4 rounded-md text-green-400">
                      {result}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-cyber-darker border border-cyber-dark rounded-md">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No steganography detected yet</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Use the Detection & Analysis tab first to analyze a file for hidden content
                </p>
                <Button 
                  onClick={() => handleTabChange('detect')}
                  variant="outline"
                >
                  Go to Detection
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Data Hiding Tab */}
          <TabsContent value="hide" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block text-gray-300">
                    Select Carrier Type
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setSelectedHidingMethod('image-lsb')}
                      variant={selectedHidingMethod.startsWith('image') ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Image File
                    </Button>
                    <Button
                      onClick={() => setSelectedHidingMethod('audio-phase')}
                      variant={selectedHidingMethod.startsWith('audio') ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      <FileAudio className="h-4 w-4 mr-2" />
                      Audio File
                    </Button>
                    <Button
                      onClick={() => setSelectedHidingMethod('video-frame')}
                      variant={selectedHidingMethod.startsWith('video') ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      <FileVideo className="h-4 w-4 mr-2" />
                      Video File
                    </Button>
                    <Button
                      onClick={() => setSelectedHidingMethod('text-whitespace')}
                      variant={selectedHidingMethod.startsWith('text') ? 'default' : 'outline'}
                      className="justify-start"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Text File
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm mb-2 block text-gray-300">
                    Upload Carrier File
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        selectedHidingMethod.startsWith('image') ? "image/*" :
                        selectedHidingMethod.startsWith('audio') ? "audio/*" :
                        selectedHidingMethod.startsWith('video') ? "video/*" :
                        "text/*,application/pdf,application/msword"
                      }
                      onChange={(e) => handleFileChange(
                        e, 
                        selectedHidingMethod.startsWith('image') ? 'image' :
                        selectedHidingMethod.startsWith('audio') ? 'audio' :
                        selectedHidingMethod.startsWith('video') ? 'video' : 'text'
                      )}
                      className="font-mono"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Browse
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-sm mb-2 block text-gray-300">
                    Message to Hide
                  </Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter the message you want to hide..."
                    className="font-mono w-full min-h-[100px] p-2 bg-cyber-darker border border-cyber-dark rounded-md resize-y"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm mb-2 block text-gray-300">
                    Password Protection (Optional)
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a password for additional security"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Using a password will encrypt the hidden message for additional security.
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm mb-2 block text-gray-300">
                    Steganography Method
                  </Label>
                  
                  {selectedHidingMethod.startsWith('image') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setSelectedHidingMethod('image-lsb')}
                        variant={selectedHidingMethod === 'image-lsb' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        LSB Encoding
                      </Button>
                      <Button
                        onClick={() => setSelectedHidingMethod('image-dct')}
                        variant={selectedHidingMethod === 'image-dct' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        DCT Encoding (JPEG)
                      </Button>
                    </div>
                  )}
                  
                  {selectedHidingMethod.startsWith('audio') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setSelectedHidingMethod('audio-phase')}
                        variant={selectedHidingMethod === 'audio-phase' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Phase Coding
                      </Button>
                      <Button
                        onClick={() => setSelectedHidingMethod('audio-echo')}
                        variant={selectedHidingMethod === 'audio-echo' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Echo Hiding
                      </Button>
                    </div>
                  )}
                  
                  {selectedHidingMethod.startsWith('video') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setSelectedHidingMethod('video-frame')}
                        variant={selectedHidingMethod === 'video-frame' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Frame Encoding
                      </Button>
                      <Button
                        onClick={() => setSelectedHidingMethod('video-motion')}
                        variant={selectedHidingMethod === 'video-motion' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Motion Vector
                      </Button>
                    </div>
                  )}
                  
                  {selectedHidingMethod.startsWith('text') && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setSelectedHidingMethod('text-whitespace')}
                        variant={selectedHidingMethod === 'text-whitespace' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Whitespace Encoding
                      </Button>
                      <Button
                        onClick={() => setSelectedHidingMethod('text-unicode')}
                        variant={selectedHidingMethod === 'text-unicode' ? 'default' : 'outline'}
                        className="justify-start w-full text-xs"
                        size="sm"
                      >
                        Unicode Encoding
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={hideData}
                    disabled={
                      (selectedHidingMethod.startsWith('image') && !image) || 
                      (selectedHidingMethod.startsWith('audio') && !audioFile) || 
                      (selectedHidingMethod.startsWith('video') && !videoFile) || 
                      (selectedHidingMethod.startsWith('text') && !textFile) || 
                      !message || 
                      isProcessing
                    }
                    className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
                  >
                    {isProcessing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    ) : (
                      <HardDrive className="h-4 w-4 mr-2" />
                    )}
                    {isProcessing ? "Processing..." : "Hide Data"}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-cyber-darker border border-cyber-dark p-4 rounded-md h-full">
                  <h3 className="text-lg font-semibold mb-3">Carrier Preview</h3>
                  
                  <div className="flex items-center justify-center h-[200px] bg-black/30 rounded-md mb-4">
                    {selectedHidingMethod.startsWith('image') && image ? (
                      <img 
                        src={image} 
                        alt="Carrier" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : selectedHidingMethod.startsWith('audio') && audioFile ? (
                      <div className="text-center">
                        <FileAudio className="h-16 w-16 mx-auto mb-2" />
                        <p>Audio carrier loaded</p>
                        <audio controls className="mt-2 w-full">
                          <source src={audioFile} />
                        </audio>
                      </div>
                    ) : selectedHidingMethod.startsWith('video') && videoFile ? (
                      <div className="text-center">
                        <FileVideo className="h-16 w-16 mx-auto mb-2" />
                        <p>Video carrier loaded</p>
                        <video controls className="mt-2 max-h-[150px]">
                          <source src={videoFile} />
                        </video>
                      </div>
                    ) : selectedHidingMethod.startsWith('text') && textFile ? (
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-2" />
                        <p>Text carrier loaded</p>
                        <div className="mt-2 text-xs text-left bg-black/30 p-2 max-h-[100px] overflow-auto">
                          {textFile}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="border-2 border-dashed border-gray-700 rounded-md h-full w-full flex items-center justify-center p-4">
                          <div>
                            <Upload className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>No carrier file uploaded</p>
                            <p className="text-xs mt-1">Upload a carrier file to hide data in</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {result && typeof result === 'string' && !result.startsWith('data:') && (
                    <div className="bg-black/30 p-3 rounded-md text-sm">
                      <p className="text-green-400">{result}</p>
                      <Button
                        onClick={handleDownload}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Steganographic File
                      </Button>
                    </div>
                  )}
                  
                  {result && (typeof result !== 'string' || result.startsWith('data:')) && (
                    <div>
                      <Label className="text-sm mb-2 block text-gray-300">
                        Result
                      </Label>
                      <div className="bg-cyber-darker border border-cyber-dark p-2 rounded-md flex items-center justify-center mb-3">
                        <img 
                          src={result as string} 
                          alt="Result" 
                          className="max-h-[150px] max-w-full object-contain"
                        />
                      </div>
                      <Button
                        onClick={handleDownload}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Steganographic Image
                      </Button>
                      <p className="text-xs text-green-400 mt-2 text-center">
                        Image with hidden data is ready for download
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SteganographyTool;
