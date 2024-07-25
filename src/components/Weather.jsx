import React, { useState } from "react";
import axios from "axios";
import getWeatherIconUrl from "./WeatherIcons";
import "../index.css"; // Ensure this path is correct

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
      const { lat, lon } = await fetchCoordinates();
      const response = await axios.get(
        `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current_weather=true&timezone=auto`
      );
      console.log("Weather Data:", response.data);
      setWeather(response.data);
    } catch (err) {}
  };

  return (
    <>
      <div className="weather-container">
        <h1 className="weather-title">Weather Platform</h1>
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter a city"
          />
        </div>
        <button className="button-primary" onClick={fetchWeather}>
          Get Weather
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="seperate-section">
        {weather && (
          <div className="daily-forecast-section">
            <div className="current-weather">
              <h2>Current Weather</h2>
              <p>Temperature: {weather.current_weather.temperature}°C</p>
              <p>Weather: {weather.current_weather.weathercode}</p>
              <img
                src={getWeatherIconUrl(weather.current_weather.weathercode)}
                alt={`Current weather icon for ${weather.current_weather.weathercode}`}
                className="weather-icon"
              />
            </div>
            <h2>Daily Forecast</h2>
            {weather.daily &&
              weather.daily.time.map((date, index) => (
                <div key={index} className="daily-forecast">
                  <h3>
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <img
                    src={getWeatherIconUrl(weather.daily.weathercode[index])}
                    alt={`Weather icon for ${weather.daily.weathercode[index]}`}
                    className="weather-icon"
                  />
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
    </>
  );
};

export default Weather;
