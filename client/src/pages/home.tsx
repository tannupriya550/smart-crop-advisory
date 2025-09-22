import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WeatherWidget } from '@/components/weather-widget';
import { useLanguage } from '@/hooks/use-language';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Sprout, MessageCircle, Calculator, Star, Scan } from 'lucide-react';
import { FarmProfile } from '@shared/schema';

export default function Home() {
  const { t } = useLanguage();
  const [farmProfile] = useLocalStorage<Partial<FarmProfile> | null>('farm-profile', null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Weather and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <WeatherWidget />
        </div>
        
        {/* Quick Actions Card */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4" data-testid="text-quick-actions">
              {t('quickActions')}
            </h2>
            <div className="space-y-3">
              <Link href="/recommendations">
                <Button 
                  className="w-full justify-start space-x-3" 
                  data-testid="button-recommendations"
                >
                  <Sprout className="h-4 w-4" />
                  <span>{t('recommendations')}</span>
                </Button>
              </Link>
              <Link href="/chat">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start space-x-3"
                  data-testid="button-chat"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t('askAI')}</span>
                </Button>
              </Link>
              <Link href="/calculator">
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3"
                  data-testid="button-calculator"
                >
                  <Calculator className="h-4 w-4" />
                  <span>{t('calculator')}</span>
                </Button>
              </Link>
              {/* ✅ New Detect Disease button (no translation error) */}
              <Link href="/detect">
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3"
                  data-testid="button-detect"
                >
                  <Scan className="h-4 w-4" />
                  <span>Crop Disease Detection</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Profile and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farm Profile */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground" data-testid="text-farm-profile">
                {t('farmProfile')}
              </h2>
              <Link href="/profile">
                <Button variant="ghost" size="sm" data-testid="button-edit-profile">
                  {t('edit')}
                </Button>
              </Link>
            </div>
            
            {farmProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">{t('farmSize')}</label>
                    <p className="font-medium" data-testid="text-farm-size">
                      {farmProfile.farmSize} {t('acres')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{t('soilType')}</label>
                    <p className="font-medium" data-testid="text-soil-type">
                      {farmProfile.soilType}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">{t('previousCrop')}</label>
                  <p className="font-medium" data-testid="text-previous-crop">
                    {farmProfile.previousCrops?.length ? farmProfile.previousCrops[0] : 'None'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">{t('irrigation')}</label>
                  <p className="font-medium" data-testid="text-irrigation">
                    {farmProfile.irrigation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4" data-testid="text-no-profile">
                  No farm profile found. Create one to get personalized recommendations.
                </p>
                <Link href="/profile">
                  <Button data-testid="button-create-profile">Create Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Recommendations */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4" data-testid="text-recommendations">
              {t('currentSeason')} (Kharif 2024)
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-md border border-primary/20" data-testid="card-recommendation-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Star className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Soybean</p>
                    <p className="text-sm text-muted-foreground">Best match: 95%</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">₹45,000/acre</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border" data-testid="card-recommendation-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                    <Sprout className="text-secondary h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Maize</p>
                    <p className="text-sm text-muted-foreground">Good match: 82%</p>
                  </div>
                </div>
                <span className="text-sm font-medium">₹38,000/acre</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border" data-testid="card-recommendation-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Sprout className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Cotton</p>
                    <p className="text-sm text-muted-foreground">Fair match: 70%</p>
                  </div>
                </div>
                <span className="text-sm font-medium">₹65,000/acre</span>
              </div>
            </div>
            
            <Link href="/recommendations">
              <Button variant="outline" className="w-full mt-4" data-testid="button-detailed-analysis">
                {t('viewDetailedAnalysis')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
