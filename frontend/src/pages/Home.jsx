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
  FaSun,
  FaMoon,
  FaQuoteLeft,
} from "react-icons/fa6";

function Home() {
  const [city, setCity] = useState("Hyderabad");

  const [weather, setWeather] = useState(null);

  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const fetchWeather = async (searchCity) => {
    try {
      setLoading(true);
      setError("");

      // =========================
      // CURRENT WEATHER
      // =========================

      const weatherResponse = await fetch(
        `http://localhost:5000/api/weather?city=${encodeURIComponent(
          searchCity
        )}`
      );

      const weatherData = await weatherResponse.json();

      if (!weatherResponse.ok || !weatherData.success) {
        throw new Error(
          weatherData.message ||
            "Unable to fetch weather"
        );
      }

      setWeather(weatherData);
      setCity(weatherData.city);


      // =========================
      // 5 DAY FORECAST
      // =========================

      const forecastResponse = await fetch(
        `http://localhost:5000/api/weather/forecast?city=${encodeURIComponent(
          searchCity
        )}`
      );

      const forecastData =
        await forecastResponse.json();

      console.log(
        "5 DAY FORECAST:",
        forecastData
      );

      if (
        !forecastResponse.ok ||
        !forecastData.success ||
        !Array.isArray(
          forecastData.forecast
        )
      ) {
        throw new Error(
          forecastData.message ||
            "Unable to fetch 5-day forecast"
        );
      }

      setForecast(
        forecastData.forecast
      );

    } catch (err) {

      console.error(
        "Weather Error:",
        err
      );

      setError(
        err.message ||
          "Unable to fetch weather data"
      );

      setForecast([]);

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // FIRST LOAD
  // =========================

  useEffect(() => {

    fetchWeather("Hyderabad");

  }, []);


  // =========================
  // SEARCH
  // =========================

  const handleSearch = (searchCity) => {

    if (
      !searchCity ||
      !searchCity.trim()
    ) {
      return;
    }

    fetchWeather(
      searchCity.trim()
    );

  };


  return (
    <main className="weather-page">

      {/* ================= HERO ================= */}

      <section className="hero-section">

        <p className="hello-text">
          Hello there! 👋
        </p>

        <h1 className="main-title">
          Weather <span>Report</span>
        </h1>

        <p className="subtitle">
          Stay ahead with accurate weather updates
        </p>

        <SearchBar
          onSearch={handleSearch}
        />

        {loading && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "600",
            }}
          >
            Loading weather...
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "15px",
              color: "#d32f2f",
              fontWeight: "600",
            }}
          >
            {error}
          </p>
        )}

      </section>


      {/* ================= CURRENT WEATHER ================= */}

      <section className="dashboard-grid">

        <WeatherCard
          city={city}
          weather={weather}
        />

        <div className="features-section">

          <FeatureCard
            icon={<FaCloudSun />}
            title="Accurate Forecast"
            description="Get reliable and simple weather information."
            className="feature-blue"
          />

          <FeatureCard
            icon={<FaCalendarDays />}
            title="5-Day Forecast"
            description="Plan your next five days with confidence."
            className="feature-green"
          />

          <FeatureCard
            icon={<FaMapLocationDot />}
            title="City Search"
            description="Search weather information for any city."
            className="feature-purple"
          />

        </div>

      </section>


      {/* ================= 5 DAY FORECAST ================= */}

      <section className="forecast-section">

        <div className="section-heading">

          <h2>
            <FaCalendarDays />
            5-Day Forecast
          </h2>

          <button className="view-more">
            View More →
          </button>

        </div>


        <div className="forecast-grid">

          {loading ? (

            <p>
              Loading 5-day forecast...
            </p>

          ) : forecast.length > 0 ? (

            forecast.map(
              (item, index) => (

                <ForecastCard
                  key={index}
                  day={item.day}
                  date={item.date}
                  icon={item.icon}
                  max={item.max}
                  min={item.min}
                  condition={item.condition}
                />

              )
            )

          ) : (

            <p>
              5-day forecast is not available.
            </p>

          )}

        </div>

      </section>


      {/* ================= EXTRA FEATURES ================= */}

      <section className="extra-features">

        <div className="info-card">

          <div className="info-title">
            <FaLeaf />
            <h3>Air Quality</h3>
          </div>

          <div className="circle-value air-quality">
            <strong>42</strong>
            <span>Good</span>
          </div>

          <p>
            Air quality is good and comfortable
            for outdoor activities.
          </p>

        </div>


        <div className="info-card">

          <div className="info-title">
            <FaSun />
            <h3>UV Index</h3>
          </div>

          <div className="circle-value uv-index">
            <strong>6</strong>
            <span>High</span>
          </div>

          <p>
            Wear sunscreen and protect yourself
            from strong sunlight.
          </p>

        </div>


        <div className="info-card">

          <div className="info-title">
            <FaMoon />
            <h3>Moon Phase</h3>
          </div>

          <div className="moon-content">

            <div className="moon">
              🌕
            </div>

            <div>

              <strong>
                Waxing Gibbous
              </strong>

              <p>
                Illumination: 68%
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= QUOTE ================= */}

      <section className="quote-section">

        <FaQuoteLeft className="quote-icon" />

        <div>

          <p>
            The best thing one can do when
            it's raining is to let it rain.
          </p>

          <span>
            — Henry Wadsworth Longfellow
          </span>

        </div>

        <div className="quote-decoration">
          ☂️
        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          © 2026 Weather Report
        </p>

        <p>
          Made with React ❤️
        </p>

      </footer>

    </main>
  );
}

export default Home;