import { Sun, Droplets, Wind, Thermometer, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  location: string;
  alert?: string;
}

interface WeatherWidgetProps {
  weather?: WeatherData;
}

// Mock weather data - in a real app this would come from an API
const mockWeather: WeatherData = {
  temperature: 28,
  condition: 'Sunny',
  humidity: 65,
  rainfall: 2,
  windSpeed: 12,
  location: 'Nashik, Maharashtra',
  alert: 'Good weather for spraying pesticides. Avoid watering in afternoon heat.'
};

export function WeatherWidget({ weather = mockWeather }: WeatherWidgetProps) {
  const { t } = useLanguage();

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground" data-testid="text-weather-title">
            Today's {t('weather')}
          </h2>
          <span className="text-sm text-muted-foreground" data-testid="text-location">
            {weather.location}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <Sun className="text-3xl text-yellow-500" data-testid="icon-weather" />
            </div>
            <div>
              <p className="text-3xl font-bold" data-testid="text-temperature">
                {weather.temperature}°C
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-condition">
                {weather.condition}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm flex items-center gap-1">
                <Droplets className="h-4 w-4" />
                {t('humidity')}:
              </span>
              <span className="text-sm font-medium" data-testid="text-humidity">
                {weather.humidity}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                {t('rainfall')}:
              </span>
              <span className="text-sm font-medium" data-testid="text-rainfall">
                {weather.rainfall}mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm flex items-center gap-1">
                <Wind className="h-4 w-4" />
                {t('wind')}:
              </span>
              <span className="text-sm font-medium" data-testid="text-wind">
                {weather.windSpeed} km/h
              </span>
            </div>
          </div>
          
          {weather.alert && (
            <div className="bg-accent/10 rounded-md p-3 border border-accent/20">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="text-accent text-sm" />
                <span className="text-sm font-medium text-accent-foreground" data-testid="text-alert-title">
                  {t('farmingAlert')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground" data-testid="text-alert-message">
                {weather.alert}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
