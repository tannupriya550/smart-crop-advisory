import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { weatherService, type WeatherData } from '@/lib/weather-service';
import { FarmProfile } from '@shared/schema';
import { MapPin, Thermometer, Droplets, Wind, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

interface WeatherWidgetProps {
  className?: string;
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [farmProfile] = useLocalStorage<Partial<FarmProfile> | null>('farm-profile', null);
  const [weatherData, setWeatherData] = useLocalStorage<WeatherData | null>('weather-data', null);
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useLocalStorage<string>('weather-last-updated', '');

  // Check if we need to refresh weather data (older than 30 minutes)
  const needsRefresh = () => {
    if (!lastUpdated || !weatherData) return true;
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return new Date(lastUpdated) < thirtyMinutesAgo;
  };

  // Auto-fetch weather for farm profile location
  useEffect(() => {
    if (farmProfile?.location && needsRefresh()) {
      fetchWeather(farmProfile.location);
    }
  }, [farmProfile?.location]);

  const fetchWeather = async (location: string) => {
    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const data = await weatherService.getCompleteWeatherData(location);
      if (data) {
        setWeatherData(data);
        setLastUpdated(new Date().toISOString());
        toast({
          title: "Weather Updated",
          description: `Weather data fetched for ${data.location}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not fetch weather data for this location",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const location = weatherData?.location || farmProfile?.location || locationInput;
    if (location) {
      fetchWeather(location);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getFarmingAdvice = () => {
    if (!weatherData) return [];
    return weatherService.getFarmingAdvice(weatherData, language);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" data-testid="text-weather-title">
            <MapPin className="h-5 w-5 text-primary" />
            {language === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Forecast'}
          </CardTitle>
          {weatherData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              data-testid="button-refresh-weather"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Input */}
        <div className="flex gap-2">
          <Input
            placeholder={language === 'hi' ? 'स्थान दर्ज करें...' : 'Enter location...'}
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather(locationInput)}
            data-testid="input-weather-location"
          />
          <Button 
            onClick={() => fetchWeather(locationInput)}
            disabled={loading || !locationInput.trim()}
            data-testid="button-fetch-weather"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Get Weather'}
          </Button>
        </div>

        {/* Current Weather */}
        {weatherData && (
          <>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg" data-testid="text-current-location">
                  {weatherData.location}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {language === 'hi' ? 'अभी' : 'Now'}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl">
                  {weatherService.getWeatherDescription(weatherData.current.weatherCode).icon}
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="text-current-temperature">
                    {weatherData.current.temperature}°C
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weatherService.getWeatherDescription(weatherData.current.weatherCode).description}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-1" data-testid="text-current-humidity">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>{weatherData.current.humidity}%</span>
                </div>
                <div className="flex items-center gap-1" data-testid="text-current-wind">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>{weatherData.current.windSpeed} km/h</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>

            {/* Farming Advice */}
            {getFarmingAdvice().length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-sm">
                    {language === 'hi' ? 'कृषि सलाह' : 'Farming Advice'}
                  </span>
                </div>
                <div className="space-y-1">
                  {getFarmingAdvice().map((advice, index) => (
                    <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200" data-testid={`text-advice-${index}`}>
                      • {advice}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {language === 'hi' ? '7-दिन का पूर्वानुमान' : '7-Day Forecast'}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {weatherData.daily.slice(0, 7).map((day, index) => (
                  <div 
                    key={day.date} 
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                    data-testid={`forecast-day-${index}`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg">
                        {weatherService.getWeatherDescription(day.weatherCode).icon}
                      </span>
                      <div className="text-sm">
                        <div className="font-medium">{formatDate(day.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {weatherService.getWeatherDescription(day.weatherCode).description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{day.temperatureMax}°/{day.temperatureMin}°</div>
                      <div className="text-xs text-muted-foreground">
                        {day.precipitation > 0 && `💧 ${day.precipitation}mm`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* No weather data state */}
        {!weatherData && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{language === 'hi' 
              ? 'मौसम की जानकारी देखने के लिए स्थान दर्ज करें' 
              : 'Enter a location to view weather information'
            }</p>
            {farmProfile?.location && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => fetchWeather(farmProfile.location!)}
                data-testid="button-use-profile-location"
              >
                Use Profile Location: {farmProfile.location}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Export both named and default for compatibility
export default WeatherWidget;