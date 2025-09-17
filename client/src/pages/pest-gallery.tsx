import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/use-language';
import { pestDatabase, searchPests } from '@/lib/pest-data';
import { Camera, Search, Bug, Leaf, AlertTriangle, Upload, X, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest, queryClient } from '@/lib/queryClient';

export default function PestGallery() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPests, setFilteredPests] = useState(pestDatabase);
  const [selectedPest, setSelectedPest] = useState<typeof pestDatabase[0] | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilteredPests(searchPests(query));
    } else {
      setFilteredPests(pestDatabase);
    }
  };

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1024px)
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Detection mutation
  const detectionMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest('POST', '/api/detections', {
        imageBase64: imageData,
        profileId: null, // Can be set if user has profile
        topK: 3
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setDetectionResult(data);
    },
    onError: (error: any) => {
      console.error('Detection failed:', error);
    }
  });

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    try {
      // Compress image
      const compressedImage = await compressImage(file);
      setUploadedImage(compressedImage);
      
      // Start detection
      detectionMutation.mutate(compressedImage);
    } catch (error) {
      console.error('Image processing failed:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  // Handle camera/upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Clear detection results
  const clearDetection = () => {
    setUploadedImage(null);
    setDetectionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2" data-testid="text-gallery-title">
          <Bug className="h-6 w-6 text-primary" />
          {t('pestGallery')}
        </h1>
        <p className="text-muted-foreground">
          Identify common pests and diseases affecting your crops
        </p>
      </div>

      {/* Upload and Search Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="input-image-upload"
              />
              <Button 
                onClick={handleUploadClick}
                disabled={detectionMutation.isPending}
                className="flex items-center gap-2" 
                data-testid="button-upload-photo"
              >
                {detectionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    {t('uploadPhoto')}
                  </>
                )}
              </Button>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pests, crops, or symptoms..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-pests"
              />
            </div>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-primary mt-1 h-4 w-4" />
              <div>
                <p className="text-sm font-medium text-primary mb-1" data-testid="text-tip-title">
                  {t('quickTip')}
                </p>
                <p className="text-sm text-muted-foreground" data-testid="text-tip-message">
                  {t('tipMessage')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detection Results */}
      {uploadedImage && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2" data-testid="text-detection-title">
                <CheckCircle className="h-5 w-5 text-primary" />
                AI Detection Results
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearDetection}
                data-testid="button-clear-detection"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Uploaded Image */}
              <div>
                <h4 className="font-medium mb-2">Uploaded Image</h4>
                <img 
                  src={uploadedImage} 
                  alt="Uploaded crop image" 
                  className="w-full h-48 object-cover rounded-lg border"
                  data-testid="img-uploaded"
                />
              </div>

              {/* Detection Results */}
              <div>
                <h4 className="font-medium mb-2">Analysis Results</h4>
                
                {detectionMutation.isPending && (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                )}

                {detectionResult && (
                  <div className="space-y-4" data-testid="div-detection-results">
                    {/* Primary Detection */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary" data-testid="text-detected-class">
                          {detectionResult.detectedClass.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <Badge variant="secondary" data-testid="badge-confidence">
                          {Math.round(detectionResult.confidence * 100)}% confident
                        </Badge>
                      </div>
                      
                      {detectionResult.matchedPest && (
                        <div className="mt-2">
                          <Badge 
                            variant={getSeverityColor(detectionResult.matchedPest.severity) as any}
                            data-testid={`badge-severity-detected`}
                          >
                            {detectionResult.matchedPest.severity} Risk
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Alternative Detections */}
                    {detectionResult.alternatives && detectionResult.alternatives.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Other Possibilities:</p>
                        <div className="space-y-1">
                          {detectionResult.alternatives.map((alt: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                              <span data-testid={`text-alternative-${idx}`}>
                                {alt.class.replace(/_/g, ' ')}
                              </span>
                              <span data-testid={`text-alt-confidence-${idx}`}>
                                {Math.round(alt.confidence * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {detectionResult.recommendations && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {detectionResult.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start" data-testid={`text-recommendation-${idx}`}>
                              <span className="text-primary mr-2">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* View Full Details Button */}
                    {detectionResult.matchedPest && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedPest(detectionResult.matchedPest)}
                            data-testid="button-view-full-treatment"
                          >
                            <Leaf className="h-4 w-4 mr-2" />
                            View Full Treatment Details
                          </Button>
                        </DialogTrigger>
                        
                        {selectedPest && selectedPest.id === detectionResult.matchedPest.id && (
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2" data-testid="text-detected-dialog-title">
                                <Bug className="h-5 w-5 text-primary" />
                                {selectedPest.name} - AI Detection Result
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              <div className="p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm text-primary font-medium">AI Detection Confidence: {Math.round(detectionResult.confidence * 100)}%</p>
                              </div>

                              {selectedPest.imageUrl && (
                                <img 
                                  src={selectedPest.imageUrl} 
                                  alt={selectedPest.name}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium mb-1">Affected Crops</p>
                                  <div className="flex flex-wrap gap-1">
                                    {selectedPest.crops.map(crop => (
                                      <Badge key={crop} variant="secondary" className="text-xs">
                                        {crop}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Severity Level</p>
                                  <Badge variant={getSeverityColor(selectedPest.severity) as any}>
                                    {selectedPest.severity} Risk
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-destructive" />
                                  Symptoms to Look For
                                </h4>
                                <ul className="space-y-1">
                                  {selectedPest.symptoms.map((symptom, idx) => (
                                    <li key={idx} className="text-sm flex items-start">
                                      <span className="text-primary mr-2">•</span>
                                      {symptom}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-primary" />
                                  Treatment Methods
                                </h4>
                                <ul className="space-y-1">
                                  {selectedPest.treatment.map((treatment, idx) => (
                                    <li key={idx} className="text-sm flex items-start">
                                      <span className="text-primary mr-2">•</span>
                                      {treatment}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Prevention Tips</h4>
                                <ul className="space-y-1">
                                  {selectedPest.prevention.map((tip, idx) => (
                                    <li key={idx} className="text-sm flex items-start">
                                      <span className="text-chart-1 mr-2">•</span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    )}

                    {/* Ask AI Assistant */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Need more help?</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        data-testid="button-ask-ai"
                        onClick={() => {
                          // This could navigate to the chat page with a pre-filled prompt
                          window.location.href = `/chat?prompt=${encodeURIComponent(
                            `I detected ${detectionResult.detectedClass.replace(/_/g, ' ')} in my crop with ${Math.round(detectionResult.confidence * 100)}% confidence. What should I do?`
                          )}`;
                        }}
                      >
                        💬 Ask AI Assistant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground" data-testid="text-results-count">
          {filteredPests.length} {filteredPests.length === 1 ? 'result' : 'results'} found
        </p>
      </div>

      {/* Pest Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPests.map((pest, index) => (
          <Card key={pest.id} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-pest-${pest.id}`}>
            <div className="aspect-video bg-muted/30 relative overflow-hidden rounded-t-lg">
              {pest.imageUrl ? (
                <img 
                  src={pest.imageUrl} 
                  alt={pest.name}
                  className="w-full h-full object-cover"
                  data-testid={`img-pest-${pest.id}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bug className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <Badge 
                className={`absolute top-2 right-2`}
                variant={getSeverityColor(pest.severity) as any}
                data-testid={`badge-severity-${pest.id}`}
              >
                {pest.severity} Risk
              </Badge>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg" data-testid={`text-pest-name-${index}`}>
                    {pest.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Affects: {pest.crops.join(', ')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Common Symptoms:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {pest.symptoms.slice(0, 2).map((symptom, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-primary mr-1">•</span>
                        {symptom}
                      </li>
                    ))}
                    {pest.symptoms.length > 2 && (
                      <li className="text-xs text-muted-foreground italic">
                        +{pest.symptoms.length - 2} more symptoms
                      </li>
                    )}
                  </ul>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedPest(pest)}
                      data-testid={`button-view-treatment-${pest.id}`}
                    >
                      {t('viewTreatment')}
                    </Button>
                  </DialogTrigger>
                  
                  {selectedPest?.id === pest.id && (
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" data-testid="text-dialog-title">
                          <Bug className="h-5 w-5 text-primary" />
                          {selectedPest.name}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {selectedPest.imageUrl && (
                          <img 
                            src={selectedPest.imageUrl} 
                            alt={selectedPest.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Affected Crops</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedPest.crops.map(crop => (
                                <Badge key={crop} variant="secondary" className="text-xs">
                                  {crop}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Severity Level</p>
                            <Badge variant={getSeverityColor(selectedPest.severity) as any}>
                              {selectedPest.severity} Risk
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            Symptoms to Look For
                          </h4>
                          <ul className="space-y-1">
                            {selectedPest.symptoms.map((symptom, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-primary" />
                            Treatment Methods
                          </h4>
                          <ul className="space-y-1">
                            {selectedPest.treatment.map((treatment, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {treatment}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Prevention Tips</h4>
                          <ul className="space-y-1">
                            {selectedPest.prevention.map((tip, idx) => (
                              <li key={idx} className="text-sm flex items-start">
                                <span className="text-chart-1 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2" data-testid="text-no-pests-found">
              No pests found matching your search criteria
            </p>
            <p className="text-sm text-muted-foreground">
              Try searching with different keywords or upload a photo for identification
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
