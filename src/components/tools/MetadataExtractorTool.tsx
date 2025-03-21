
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, Upload, FileSearch, Download, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MetadataExtractorTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setMetadata(null);
  };

  const extractMetadata = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to extract metadata.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExtracting(true);
    
    // Using FileReader for actual file data
    const reader = new FileReader();
    
    reader.onload = () => {
      // Create actual metadata based on file properties
      setTimeout(() => {
        let extractedMetadata: Record<string, string> = {
          "File Name": file.name,
          "File Size": formatFileSize(file.size),
          "MIME Type": file.type || "application/octet-stream",
          "Last Modified": new Date(file.lastModified).toLocaleString(),
        };
        
        // Add type-specific properties based on actual file type
        if (file.type.startsWith('image/')) {
          // For images, we can get actual dimensions by creating an Image object
          const img = new Image();
          const imageUrl = URL.createObjectURL(file);
          
          img.onload = () => {
            const imageMetadata = {
              ...extractedMetadata,
              "Image Width": `${img.naturalWidth} px`,
              "Image Height": `${img.naturalHeight} px`,
              "Aspect Ratio": `${(img.naturalWidth / img.naturalHeight).toFixed(2)}`,
              "File Extension": file.name.split('.').pop()?.toUpperCase() || "Unknown",
            };
            
            setMetadata(imageMetadata);
            setIsExtracting(false);
            URL.revokeObjectURL(imageUrl);
            
            toast({
              title: "Metadata extracted",
              description: `Successfully extracted metadata from ${file.name}`,
            });
          };
          
          img.onerror = () => {
            setMetadata(extractedMetadata);
            setIsExtracting(false);
            URL.revokeObjectURL(imageUrl);
            
            toast({
              title: "Limited metadata extracted",
              description: "Could not load complete image data",
            });
          };
          
          img.src = imageUrl;
        } else if (file.type === 'application/pdf') {
          // For PDFs, add common PDF properties
          extractedMetadata = {
            ...extractedMetadata,
            "File Extension": "PDF",
            "Document Type": "Portable Document Format",
          };
          setMetadata(extractedMetadata);
          setIsExtracting(false);
          
          toast({
            title: "Metadata extracted",
            description: `Successfully extracted metadata from ${file.name}`,
          });
        } else if (file.type.startsWith('audio/')) {
          // For audio files
          extractedMetadata = {
            ...extractedMetadata,
            "File Extension": file.name.split('.').pop()?.toUpperCase() || "Unknown",
            "Audio Type": file.type.split('/')[1]?.toUpperCase() || "Unknown",
          };
          setMetadata(extractedMetadata);
          setIsExtracting(false);
          
          toast({
            title: "Metadata extracted",
            description: `Successfully extracted metadata from ${file.name}`,
          });
        } else if (file.type.startsWith('video/')) {
          // For video files
          extractedMetadata = {
            ...extractedMetadata,
            "File Extension": file.name.split('.').pop()?.toUpperCase() || "Unknown",
            "Video Type": file.type.split('/')[1]?.toUpperCase() || "Unknown",
          };
          setMetadata(extractedMetadata);
          setIsExtracting(false);
          
          toast({
            title: "Metadata extracted",
            description: `Successfully extracted metadata from ${file.name}`,
          });
        } else {
          // Generic metadata for other file types
          extractedMetadata = {
            ...extractedMetadata,
            "File Extension": file.name.split('.').pop()?.toUpperCase() || "Unknown",
          };
          setMetadata(extractedMetadata);
          setIsExtracting(false);
          
          toast({
            title: "Metadata extracted",
            description: `Successfully extracted metadata from ${file.name}`,
          });
        }
      }, 1500);
    };
    
    reader.onerror = () => {
      setIsExtracting(false);
      toast({
        title: "Error extracting metadata",
        description: "Could not read the file",
        variant: "destructive",
      });
    };
    
    // Start reading the file - just the header for metadata
    reader.readAsArrayBuffer(file.slice(0, 16384)); // Read just the first 16KB
  };

  const handleCopy = () => {
    if (!metadata) return;
    
    const metadataText = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    navigator.clipboard.writeText(metadataText);
    
    toast({
      title: "Copied to clipboard",
      description: "Metadata has been copied to your clipboard",
    });
  };

  const handleSave = () => {
    if (!metadata) return;
    
    const metadataText = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const blob = new Blob([metadataText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata_${file?.name || 'file'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setMetadata(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="animate-fade-up w-full max-w-2xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <FileSearch className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Metadata Extractor</h2>
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
          <div className="w-full">
            <Label htmlFor="file-upload" className="text-sm mb-2 block text-gray-300">
              Upload File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
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
            <p className="text-xs text-gray-400 mt-1">
              Supported file types: Images (JPG, PNG, GIF), Documents (PDF, DOCX), Audio, Video and others.
            </p>
          </div>
          
          {file && (
            <div className="w-full">
              <Button
                onClick={extractMetadata}
                disabled={isExtracting}
                className="w-full bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isExtracting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                ) : (
                  <FileSearch className="h-4 w-4 mr-2" />
                )}
                {isExtracting ? "Extracting..." : "Extract Metadata"}
              </Button>
            </div>
          )}
          
          {metadata && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm text-gray-300">
                  Metadata Results
                </Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="bg-cyber-darker border border-cyber-dark rounded-md overflow-hidden">
                <div className="p-2 bg-cyber-blue/20 border-b border-cyber-dark">
                  <p className="font-mono text-sm font-medium">
                    {file?.name} ({formatFileSize(file?.size || 0)})
                  </p>
                </div>
                <div className="p-4">
                  <table className="w-full border-collapse">
                    <tbody>
                      {Object.entries(metadata).map(([key, value]) => (
                        <tr key={key} className="border-b border-cyber-dark/50 last:border-0">
                          <td className="py-1 pr-4 text-sm font-medium text-gray-300 whitespace-nowrap">
                            {key}
                          </td>
                          <td className="py-1 pl-4 text-sm font-mono break-all">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataExtractorTool;
