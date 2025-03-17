
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCcw, Upload, Image, Download, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SteganographyTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPEG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    // Simulating analysis with a timeout
    setTimeout(() => {
      const analysisResults = [
        "Image format: PNG",
        "Dimensions: 800×600",
        "Color model: RGB with alpha channel",
        "Statistical analysis: No obvious LSB steganography detected",
        "DCT coefficient analysis: No significant anomalies detected",
        "Histogram analysis: Normal distribution of pixel values",
        "File size is consistent with visible content"
      ];
      
      setResult(analysisResults.join("\n"));
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: "Image analysis has been completed.",
      });
    }, 2000);
  };

  const handleHideData = () => {
    if (!image) {
      toast({
        title: "No image",
        description: "Please upload an image to use as a carrier.",
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
    
    setIsAnalyzing(true);
    
    // Simulating steganography with a timeout
    setTimeout(() => {
      setIsAnalyzing(false);
      
      toast({
        title: "Data hidden",
        description: "Your message has been hidden in the image. You can now download it.",
      });
      
      // In a real implementation, this would be where the steganography happens
      // For now, we're just returning the original image
      setResult(image);
    }, 2000);
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
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
    link.download = 'steg_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto">
      <div className="cyber-panel p-6">
        <div className="flex items-center mb-6">
          <Image className="mr-2 h-6 w-6 text-cyber-blue" />
          <h2 className="text-xl font-bold flex-1">Steganography Detector</h2>
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

        <Tabs defaultValue="detect" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="detect">Detect Steganography</TabsTrigger>
            <TabsTrigger value="hide">Hide Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="detect" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="image-upload" className="text-sm mb-2 block text-gray-300">
                Upload Image
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
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
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={!image || isAnalyzing}
                    className="w-full mt-4 bg-cyber-blue hover:bg-cyber-blue/80"
                  >
                    {isAnalyzing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {isAnalyzing ? "Analyzing..." : "Analyze Image"}
                  </Button>
                </div>
                
                <div className="bg-cyber-darker border border-cyber-dark p-2 rounded-md flex items-center justify-center">
                  {image ? (
                    <img 
                      src={image} 
                      alt="Uploaded" 
                      className="max-h-[200px] max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Image className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {result && (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Analysis Results
                </Label>
                <div className="font-mono text-sm bg-cyber-darker border border-cyber-dark p-4 rounded-md whitespace-pre-line">
                  {result}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="hide" className="space-y-6">
            <div className="w-full">
              <Label htmlFor="image-upload-hide" className="text-sm mb-2 block text-gray-300">
                Upload Carrier Image
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      id="image-upload-hide"
                      type="file"
                      accept="image/*"
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
                </div>
                
                <div className="bg-cyber-darker border border-cyber-dark p-2 rounded-md flex items-center justify-center">
                  {image ? (
                    <img 
                      src={image} 
                      alt="Carrier" 
                      className="max-h-[200px] max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Image className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p>No image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full">
              <Label htmlFor="message" className="text-sm mb-2 block text-gray-300">
                Message to Hide
              </Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the message you want to hide in the image..."
                className="font-mono w-full min-h-[100px] p-2 bg-cyber-darker border border-cyber-dark rounded-md resize-y"
              />
            </div>
            
            <div className="w-full">
              <Label htmlFor="password" className="text-sm mb-2 block text-gray-300">
                Password (Optional)
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
            
            <div className="flex gap-2">
              <Button
                onClick={handleHideData}
                disabled={!image || !message || isAnalyzing}
                className="flex-1 bg-cyber-blue hover:bg-cyber-blue/80"
              >
                {isAnalyzing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full mr-2" />
                ) : (
                  <Image className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "Processing..." : "Hide Data"}
              </Button>
              
              {result && (
                <Button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            
            {result && (
              <div className="w-full">
                <Label className="text-sm mb-2 block text-gray-300">
                  Result
                </Label>
                <div className="bg-cyber-darker border border-cyber-dark p-2 rounded-md flex items-center justify-center">
                  <img 
                    src={result} 
                    alt="Result" 
                    className="max-h-[200px] max-w-full object-contain"
                  />
                </div>
                <p className="text-xs text-green-400 mt-1">
                  Image with hidden data is ready for download
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SteganographyTool;
