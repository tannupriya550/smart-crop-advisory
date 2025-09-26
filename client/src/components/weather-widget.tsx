import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Droplets, Wind, Calendar, RefreshCw, AlertTriangle } from "lucide-react";

interface ForecastDay {
  date: string;
  temperatureMin: number;
  temperatureMax: number;
  description: string;
  icon: string;
}

export function WeatherWidget() {
  const { toast } = useToast();
  const [location, setLocation] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [showForecast, setShowForecast] = useState(false); // 👈 toggle state

  // Helper: group 3-hour forecast into daily min/max
  const groupForecastByDay = (forecastList: any[]): ForecastDay[] => {
    const days: Record<string, any[]> = {};

    forecastList.forEach((item) => {
      const date = item.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });

    return Object.keys(days).map((date) => {
      const dayData = days[date];
      const temps = dayData.map((d) => d.main.temp);
      const min = Math.min(...temps);
      const max = Math.max(...temps);
      const weather = dayData[0].weather[0]; // just pick first

      return {
        date,
        temperatureMin: Math.round(min),
        temperatureMax: Math.round(max),
        description: weather.description,
        icon: weather.icon,
      };
    });
  };

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`/api/weather?city=${city}`),
        fetch(`/api/forecast?city=${city}`),
      ]);

      const currentData = await currentRes.json();
      const forecastData = await forecastRes.json();

      if (currentRes.ok && forecastRes.ok) {
        setCurrent(currentData);
        setForecast(groupForecastByDay(forecastData.list).slice(0, 7)); // first 7 days
      } else {
        throw new Error("Weather fetch failed");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch weather",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  return (
    <Card className="weather-3d-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Weather Forecast
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchWeather(location)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather(location)}
          />
          <Button onClick={() => fetchWeather(location)} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Get Weather"}
          </Button>
        </div>

        {/* Current Weather */}
        {current && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{current.name}</h3>
              <span className="text-sm text-muted-foreground">Now</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-2xl font-bold">
                {Math.round(current.main.temp)}°C
              </div>
              <div className="text-sm text-muted-foreground">
                {current.weather[0].description}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>{current.main.humidity}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-4 w-4 text-gray-500" />
                <span>{current.wind.speed} km/h</span>
              </div>
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        {forecast.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> 7-Day Forecast
            </h4>

            {/* Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              className="mb-2"
              onClick={() => setShowForecast(!showForecast)}
            >
              {showForecast ? "Hide Forecast" : "Show Forecast"}
            </Button>

            {/* Forecast List (only when expanded) */}
            {showForecast && (
              <div className="forecast-3d-panel grid gap-2">
                {forecast.map((day) => (
                  <div
                    key={day.date}
                    className="forecast-3d-item flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                  >
                    <div>
                      <div className="font-medium">{day.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {day.description}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {day.temperatureMax}° / {day.temperatureMin}°
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!current && !loading && (
          <div className="text-center text-muted-foreground py-8">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            Enter a location to view weather
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherWidget;
