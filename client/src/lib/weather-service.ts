export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    time: string;
  };
  daily: {
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    weatherCode: number;
  }[];
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  name: string;
}

// Weather code descriptions for Open-Meteo
export const weatherCodeDescriptions: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌨️" },
  57: { description: "Dense freezing drizzle", icon: "🌨️" },
  61: { description: "Slight rain", icon: "🌦️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Heavy freezing rain", icon: "🌨️" },
  71: { description: "Slight snow fall", icon: "🌨️" },
  73: { description: "Moderate snow fall", icon: "❄️" },
  75: { description: "Heavy snow fall", icon: "❄️" },
  77: { description: "Snow grains", icon: "🌨️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" }
};

// Major Indian cities coordinates
export const indianCities: LocationCoords[] = [
  { latitude: 28.6139, longitude: 77.2090, name: "New Delhi" },
  { latitude: 19.0760, longitude: 72.8777, name: "Mumbai" },
  { latitude: 22.5726, longitude: 88.3639, name: "Kolkata" },
  { latitude: 13.0827, longitude: 80.2707, name: "Chennai" },
  { latitude: 12.9716, longitude: 77.5946, name: "Bangalore" },
  { latitude: 17.3850, longitude: 78.4867, name: "Hyderabad" },
  { latitude: 23.0225, longitude: 72.5714, name: "Ahmedabad" },
  { latitude: 18.5204, longitude: 73.8567, name: "Pune" },
  { latitude: 22.3072, longitude: 73.1812, name: "Vadodara" },
  { latitude: 21.1702, longitude: 72.8311, name: "Surat" },
  { latitude: 26.9124, longitude: 75.7873, name: "Jaipur" },
  { latitude: 15.2993, longitude: 74.1240, name: "Goa" },
  { latitude: 11.0168, longitude: 76.9558, name: "Coimbatore" },
  { latitude: 26.8467, longitude: 80.9462, name: "Lucknow" },
  { latitude: 25.5941, longitude: 85.1376, name: "Patna" }
];

export class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  async getLocationCoords(locationName: string): Promise<LocationCoords | null> {
    try {
      // First try to find in our predefined cities
      const predefinedCity = indianCities.find(city => 
        city.name.toLowerCase().includes(locationName.toLowerCase()) ||
        locationName.toLowerCase().includes(city.name.toLowerCase())
      );

      if (predefinedCity) {
        return predefinedCity;
      }

      // Use geocoding API for other locations
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location coordinates');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting location coordinates:', error);
      return null;
    }
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData['current'] | null> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&timezone=auto`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.current) {
        throw new Error('Invalid response format - missing current weather data');
      }
      
      return {
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code,
        time: data.current.time
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherData['daily'] | null> {
    try {
      const url = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=${days}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.daily || !data.daily.time) {
        throw new Error('Invalid response format - missing daily weather data');
      }
      
      return data.daily.time.map((date: string, index: number) => ({
        date,
        temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
        temperatureMin: Math.round(data.daily.temperature_2m_min[index]),
        humidity: 0, // Not available in daily forecast, using current weather humidity instead
        precipitation: data.daily.precipitation_sum[index],
        windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
        weatherCode: data.daily.weather_code[index]
      }));
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  async getCompleteWeatherData(locationName: string): Promise<WeatherData | null> {
    try {
      const coords = await this.getLocationCoords(locationName);
      
      if (!coords) {
        throw new Error('Location not found');
      }

      const [current, daily] = await Promise.all([
        this.getCurrentWeather(coords.latitude, coords.longitude),
        this.getWeatherForecast(coords.latitude, coords.longitude)
      ]);

      if (!current || !daily) {
        throw new Error('Failed to fetch weather data');
      }
      return {
        location: coords.name,
        current,
        daily
      };
    } catch (error) {
      console.error('Error fetching complete weather data:', error);
      return null;
    }
  }

  getWeatherDescription(weatherCode: number) {
    return weatherCodeDescriptions[weatherCode] || { description: "Unknown", icon: "❓" };
  }

  // Get farming advice based on weather conditions
  getFarmingAdvice(weatherData: WeatherData, language: string = 'en'): string[] {
    const advice: string[] = [];
    const { current, daily } = weatherData;
    
    // Temperature advice
    if (current.temperature > 35) {
      advice.push(language === 'hi' 
        ? 'अत्यधिक गर्मी - पानी की मात्रा बढ़ाएं और दोपहर में काम से बचें'
        : 'Extreme heat - Increase irrigation and avoid midday fieldwork'
      );
    } else if (current.temperature < 10) {
      advice.push(language === 'hi'
        ? 'ठंड - फसलों को ढकें और सुबह की सिंचाई से बचें'
        : 'Cold weather - Cover crops and avoid morning irrigation'
      );
    }

    // Humidity advice
    if (current.humidity > 80) {
      advice.push(language === 'hi'
        ? 'उच्च नमी - फंगल रोगों से बचाव के लिए उपचार करें'
        : 'High humidity - Apply fungicide to prevent diseases'
      );
    } else if (current.humidity < 30) {
      advice.push(language === 'hi'
        ? 'कम नमी - सिंचाई की आवृत्ति बढ़ाएं'
        : 'Low humidity - Increase irrigation frequency'
      );
    }

    // Rain forecast advice
    const rainInNext3Days = daily.slice(0, 3).some(day => day.precipitation > 5);
    if (rainInNext3Days) {
      advice.push(language === 'hi'
        ? 'अगले 3 दिनों में बारिश की संभावना - सिंचाई और छिड़काव स्थगित करें'
        : 'Rain expected in next 3 days - Postpone irrigation and spraying'
      );
    }

    // Wind advice
    if (current.windSpeed > 25) {
      advice.push(language === 'hi'
        ? 'तेज हवा - कीटनाशक छिड़काव से बचें'
        : 'High winds - Avoid pesticide spraying'
      );
    }

    return advice;
  }
}

export const weatherService = new WeatherService();