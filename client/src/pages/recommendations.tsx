import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getCropRecommendations, cropDatabase } from '@/lib/crop-data';
import { Sprout, DollarSign, Clock, Droplets } from 'lucide-react';
import { FarmProfile } from '@shared/schema';

interface RecommendationWithMatch {
  name: string;
  season: string;
  soilTypes: string[];
  waterRequirement: string;
  duration: number;
  expectedYield: number;
  estimatedIncome: number;
  diseases: string[];
  fertilizers: string[];
  matchPercentage: number;
}

export default function Recommendations() {
  const { t } = useLanguage();
  const [farmProfile] = useLocalStorage<Partial<FarmProfile> | null>('farm-profile', null);
  const [recommendations, setRecommendations] = useState<RecommendationWithMatch[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('Kharif');

  useEffect(() => {
    if (farmProfile?.soilType) {
      const cropRecommendations = getCropRecommendations(
        farmProfile.soilType,
        selectedSeason,
        farmProfile.farmSize || 1
      );
      setRecommendations(cropRecommendations);
    }
  }, [farmProfile, selectedSeason]);

  if (!farmProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4" data-testid="text-no-profile">
              Please create a farm profile first to get personalized crop recommendations.
            </p>
            <Button onClick={() => window.location.href = '/profile'} data-testid="button-create-profile">
              Create Farm Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2" data-testid="text-recommendations-title">
          {t('recommendations')}
        </h1>
        <p className="text-muted-foreground">
          Based on your farm profile: {farmProfile.soilType}, {farmProfile.farmSize} acres
        </p>
      </div>

      {/* Season Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            {['Kharif', 'Rabi', 'Zaid'].map((season) => (
              <Button
                key={season}
                variant={selectedSeason === season ? 'default' : 'outline'}
                onClick={() => setSelectedSeason(season)}
                data-testid={`button-season-${season.toLowerCase()}`}
              >
                {season} Season
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid gap-6">
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-recommendations">
                No recommendations available for the selected season and soil type.
              </p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((crop, index) => (
            <Card key={crop.name} className="shadow-sm" data-testid={`card-crop-${crop.name.toLowerCase()}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-primary/20' : 'bg-secondary/20'
                    }`}>
                      <Sprout className={`h-6 w-6 ${
                        index === 0 ? 'text-primary' : 'text-secondary'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl" data-testid={`text-crop-name-${index}`}>
                        {crop.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={index === 0 ? 'default' : 'secondary'} data-testid={`badge-match-${index}`}>
                          {crop.matchPercentage}% Match
                        </Badge>
                        <Badge variant="outline">{crop.season}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary" data-testid={`text-income-${index}`}>
                      ₹{crop.estimatedIncome.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">per acre</p>
                  </div>
                </div>
                <Progress value={crop.matchPercentage} className="mt-3" />
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium" data-testid={`text-duration-${index}`}>
                        {crop.duration} days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Water Need</p>
                      <p className="font-medium" data-testid={`text-water-${index}`}>
                        {crop.waterRequirement}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Sprout className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Yield</p>
                      <p className="font-medium" data-testid={`text-yield-${index}`}>
                        {crop.expectedYield} quintal/acre
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="font-medium text-primary" data-testid={`text-total-income-${index}`}>
                        ₹{(crop.estimatedIncome * (farmProfile.farmSize || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Recommended Fertilizers</p>
                    <div className="flex flex-wrap gap-2">
                      {crop.fertilizers.map((fertilizer) => (
                        <Badge key={fertilizer} variant="outline" data-testid={`badge-fertilizer-${fertilizer.toLowerCase()}`}>
                          {fertilizer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Common Diseases to Watch</p>
                    <div className="flex flex-wrap gap-2">
                      {crop.diseases.map((disease) => (
                        <Badge key={disease} variant="destructive" data-testid={`badge-disease-${disease.toLowerCase().replace(' ', '-')}`}>
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Why this crop?</p>
                      <p className="text-sm">
                        Well-suited for {crop.soilTypes.join(', ')} with {crop.waterRequirement.toLowerCase()} water requirements
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/chat'}
                      data-testid={`button-ask-ai-${index}`}
                    >
                      Ask AI for Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
