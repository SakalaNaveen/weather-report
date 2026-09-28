import { useEffect, useState } from "react";

import SearchBar from "../components/SearchBar";
import WeatherCard from "../components/WeatherCard";
import ForecastCard from "../components/ForecastCard";
import FeatureCard from "../components/FeatureCard";

import {
  FaCalendarDays,
  FaCloudSun,
  FaMapLocationDot,
  FaLeaf,
  FaQuoteLeft,
} from "react-icons/fa6";

import "./Home.css";

function Home() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPlace, setSelectedPlace] = useState({
    name: "Hyderabad",
    mandal: "",
    district: "",
    state: "Telangana",
    latitude: null,
    longitude: null,
  });

  // FETCH WEATHER
  const fetchWeather = async (place) => {
    setLoading(true);
    setError("");

    try {
      let weatherUrl;

      if (
        place.latitude !== null &&
        place.latitude !== undefined &&
        place.longitude !== null &&
        place.longitude !== undefined
      ) {
        weatherUrl =
          "https://weather-report-backend-iuxb.onrender.com/api/weather?lat=" +
          encodeURIComponent(place.latitude) +
          "&lon=" +
          encodeURIComponent(place.longitude);
      } else {
        weatherUrl =
          "https://weather-report-backend-iuxb.onrender.com/api/weather?city=" +
          encodeURIComponent(place.name);
      }

      console.log("Weather URL:", weatherUrl);

      const response = await fetch(weatherUrl);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Weather fetch failed");
      }

      setWeather({
        ...data,
        city: place.name || data.city || "Unknown",
        mandal: place.mandal || data.mandal || "",
        district: place.district || data.district || "",
        state: place.state || data.state || "Andhra Pradesh",
      });

      // FORECAST
      try {
        let forecastUrl;

        if (
          place.latitude !== null &&
          place.latitude !== undefined &&
          place.longitude !== null &&
          place.longitude !== undefined
        ) {
          forecastUrl =
            "https://weather-report-backend-iuxb.onrender.com/api/weather/forecast?lat=" +
            encodeURIComponent(place.latitude) +
            "&lon=" +
            encodeURIComponent(place.longitude);
        } else {
          forecastUrl =
            "https://weather-report-backend-iuxb.onrender.com/api/weather/forecast?city=" +
            encodeURIComponent(place.name);
        }

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (
          forecastResponse.ok &&
          forecastData.success &&
          Array.isArray(forecastData.forecast)
        ) {
          setForecast(forecastData.forecast.slice(0, 5));
        } else {
          setForecast([]);
        }
      } catch (forecastError) {
        console.log("Forecast error:", forecastError);
        setForecast([]);
      }
    } catch (weatherError) {
      console.log("Weather error:", weatherError);

      setWeather(null);
      setForecast([]);
      setError("Unable to fetch weather for this place.");
    } finally {
      setLoading(false);
    }
  };

  // DEFAULT WEATHER
  useEffect(() => {
    fetchWeather(selectedPlace);
  }, []);

  // LOCATION RESULT CLICK
  const handleLocationSelect = (place) => {
    if (!place) {
      return;
    }

    const exactPlace = {
      name: place.name || "",
      mandal: place.mandal || "",
      district: place.district || "",
      state: place.state || "Andhra Pradesh",

      latitude:
        place.latitude !== undefined && place.latitude !== null
          ? Number(place.latitude)
          : null,

      longitude:
        place.longitude !== undefined && place.longitude !== null
          ? Number(place.longitude)
          : null,
    };

    console.log("EXACT SELECTED PLACE:", exactPlace);

    setSelectedPlace(exactPlace);
    fetchWeather(exactPlace);
  };

  // NORMAL SEARCH
  const handleNormalSearch = (searchText) => {
    if (!searchText || !searchText.trim()) {
      return;
    }

    const place = {
      name: searchText.trim(),
      mandal: "",
      district: "",
      state: "Andhra Pradesh",
      latitude: null,
      longitude: null,
    };

    setSelectedPlace(place);
    fetchWeather(place);
  };

  return (
    <div className="home-page">

      {/* HEADER */}
      <section className="hero-section">

        <div className="hello-text">
          Hello there! 👋
        </div>

        <h1 className="main-title">
          Weather <span>Report</span>
        </h1>

        <p className="subtitle">
          Stay ahead with accurate weather updates
        </p>

        {/* SEARCH */}
        <div className="search-wrapper">
          <SearchBar
            onSearch={handleLocationSelect}
            onNormalSearch={handleNormalSearch}
          />
        </div>

        {loading && (
          <div className="loading-text">
            Loading weather...
          </div>
        )}

        {error && !loading && (
          <div className="error-text">
            {error}
          </div>
        )}

      </section>

      {/* MAIN CONTENT */}
      <main className="weather-content">

        <div className="top-content">

          {/* WEATHER CARD */}
          <div className="weather-card-wrapper">
            <WeatherCard
              weather={weather}
              selectedPlace={selectedPlace}
            />
          </div>

          {/* FEATURES */}
          <div className="features-wrapper">

            <FeatureCard
              icon={<FaCloudSun />}
              title="Accurate Forecast"
              description="Get reliable and simple weather information."
            />

            <FeatureCard
              icon={<FaCalendarDays />}
              title="5-Day Forecast"
              description="Plan your next five days with confidence."
            />

            <FeatureCard
              icon={<FaMapLocationDot />}
              title="City Search"
              description="Search weather information for any city."
            />

          </div>

        </div>

        {/* FORECAST */}
        <section className="forecast-section">

          <div className="forecast-heading">

            <div className="forecast-title">

              <FaCalendarDays />

              <h2>
                5-Day Forecast
              </h2>

            </div>

            <button className="view-more-btn">
              View More →
            </button>

          </div>

          <div className="forecast-grid">

            {forecast.length > 0 ? (
              forecast.map((day, index) => (
                <ForecastCard
                  key={index}
                  forecast={day}
                />
              ))
            ) : (
              <>
                <ForecastCard />
                <ForecastCard />
                <ForecastCard />
                <ForecastCard />
                <ForecastCard />
              </>
            )}

          </div>

        </section>

        {/* BOTTOM INFO */}
        <section className="bottom-info">

          <div className="bottom-item">

            <FaLeaf />

            <div>
              <strong>
                Weather Made Simple
              </strong>

              <span>
                Clear and useful information for your day.
              </span>
            </div>

          </div>

          <div className="bottom-item quote-item">

            <FaQuoteLeft />

            <div>
              <strong>
                Stay prepared.
              </strong>

              <span>
                Check the weather before you step out.
              </span>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;