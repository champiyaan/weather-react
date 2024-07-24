import React, { useState } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const GEOCODING_API_URL = "https://nominatim.openstreetmap.org/search";
  const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

  const fetchCoordinates = async () => {
    try {
      setError("");
      const response = await axios.get(
        `${GEOCODING_API_URL}?q=${encodeURIComponent(city)}&format=json&limit=1`
      );

      if (response.data.length === 0) {
        throw new Error("City not found");
      }

      const { lat, lon } = response.data[0];
      return { lat, lon };
    } catch (err) {
      console.error(err);
      setError("City not found");
      throw err;
    }
  };

  const fetchWeather = async () => {
    try {
      const { lat, lon } = await fetchCoordinates(); // Get coordinates of the city
      const response = await axios.get(
        `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current_weather=true&timezone=auto`
      );
      console.log("Weather Data:", response.data);
      setWeather(response.data);
    } catch (err) {}
  };

  return (
    <div className="weather">
      <h1>Weather Platform</h1>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value.trim())}
        placeholder="Enter A City"
      />
      <button onClick={fetchWeather}>Get Weather</button>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="weather-info">
          <h2>Current Weather</h2>
          <p>Temperature: {weather.current_weather.temperature}°C</p>
          <p>Weather: {weather.current_weather.weathercode}</p>
          <h2>Daily Forecast</h2>
          {weather.daily &&
            weather.daily.time.map((date, index) => (
              <div key={index} className="daily-forecast">
                <h3>{new Date(date).toLocaleDateString()}</h3>
                <p>
                  Max Temperature: {weather.daily.temperature_2m_max[index]}°C
                </p>
                <p>
                  Min Temperature: {weather.daily.temperature_2m_min[index]}°C
                </p>
                <p>
                  Precipitation: {weather.daily.precipitation_sum[index]} mm
                </p>
                <p>Weather: {weather.daily.weathercode[index]}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Weather;
