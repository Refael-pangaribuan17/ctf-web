
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
    
    // Simulating metadata extraction with a timeout
    setTimeout(() => {
      let extractedMetadata: Record<string, string> = {};
      
      // Generate sample metadata based on file type
      if (file.type.startsWith('image/')) {
        extractedMetadata = {
          "File Name": file.name,
          "File Size": formatFileSize(file.size),
          "MIME Type": file.type,
          "Created": new Date().toISOString(),
          "Last Modified": new Date(file.lastModified).toISOString(),
          "Image Width": "3024 px",
          "Image Height": "4032 px",
          "Color Space": "sRGB",
          "Bit Depth": "24",
          "Camera Make": "Apple",
          "Camera Model": "iPhone 13 Pro",
          "Focal Length": "4.2mm",
          "Exposure Time": "1/120 sec",
          "Aperture": "f/1.8",
          "ISO": "100",
          "GPS Latitude": "41.40338, 2.17403", // This is just an example, not real data
          "Software": "iOS 15.4.1",
        };
      } else if (file.type.startsWith('application/pdf')) {
        extractedMetadata = {
          "File Name": file.name,
          "File Size": formatFileSize(file.size),
          "MIME Type": file.type,
          "Created": new Date().toISOString(),
          "Last Modified": new Date(file.lastModified).toISOString(),
          "PDF Version": "1.7",
          "Page Count": "24",
          "Author": "John Doe",
          "Creator": "Microsoft Word",
          "Producer": "Adobe PDF Library 15.0",
          "Title": "Confidential Report",
          "Subject": "Internal Use Only",
          "Keywords": "secret, confidential, internal",
          "Encrypted": "No",
        };
      } else {
        extractedMetadata = {
          "File Name": file.name,
          "File Size": formatFileSize(file.size),
          "MIME Type": file.type,
          "Created": new Date().toISOString(),
          "Last Modified": new Date(file.lastModified).toISOString(),
        };
      }
      
      setMetadata(extractedMetadata);
      setIsExtracting(false);
      
      toast({
        title: "Metadata extracted",
        description: `Successfully extracted metadata from ${file.name}`,
      });
    }, 1500);
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
              Supported file types: Images (JPG, PNG, GIF), Documents (PDF, DOCX), and others.
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
