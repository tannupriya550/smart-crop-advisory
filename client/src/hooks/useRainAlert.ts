// client/src/hooks/useRainAlert.ts
import { useEffect, useState } from "react";
import axios from "axios";

export function useRainAlert(city: string) {
  const [rainComing, setRainComing] = useState(false);

  useEffect(() => {
    const checkRain = async () => {
      try {
        const { data } = await axios.get(`/api/weather/rain-alert?city=${city}`);
        setRainComing(data.rainExpected);
      } catch (err) {
        console.error("Rain alert error:", err);
      }
    };

    checkRain();

    // Re-check every 30 minutes
    const interval = setInterval(checkRain, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return rainComing;
}
