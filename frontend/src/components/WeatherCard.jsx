import {
  FaLocationDot,
  FaDroplet,
  FaWind,
  FaGaugeHigh,
  FaEye,
  FaSun,
} from "react-icons/fa6";

function WeatherCard({ city, weather }) {
  if (!weather) {
    return (
      <div className="current-weather-card">
        <div className="weather-card-header">
          <div>
            <h2>
              <FaLocationDot />
              {city}, India
            </h2>

            <p>Today's Weather</p>
          </div>

          <span className="live-badge">
            <span></span>
            Live
          </span>
        </div>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading weather...
        </div>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="current-weather-card">

      {/* HEADER */}
      <div className="weather-card-header">

        <div>
          <h2>
            <FaLocationDot />
            {weather.city}, {weather.country}
          </h2>

          <p>
            Today's Weather
          </p>
        </div>

        <span className="live-badge">
          <span></span>
          Live
        </span>

      </div>


      {/* MAIN WEATHER */}
      <div className="main-weather">

        <div className="weather-icon-large">
          <img
            src={iconUrl}
            alt={weather.description}
            style={{
              width: "110px",
              height: "110px",
            }}
          />
        </div>

        <div className="temperature-large">
          {weather.temperature}
          <sup>°C</sup>
        </div>

        <div className="condition-large">

          <strong>
            {weather.condition}
          </strong>

          <span>
            Feels like {weather.feelsLike}°C
          </span>

        </div>

      </div>


      {/* WEATHER DETAILS */}
      <div className="weather-details">

        <div className="detail-item">

          <FaDroplet />

          <div>
            <small>Humidity</small>

            <strong>
              {weather.humidity}%
            </strong>
          </div>

        </div>


        <div className="detail-item">

          <FaWind />

          <div>
            <small>Wind Speed</small>

            <strong>
              {weather.windSpeed} km/h
            </strong>
          </div>

        </div>


        <div className="detail-item">

          <FaGaugeHigh />

          <div>
            <small>Pressure</small>

            <strong>
              {weather.pressure} hPa
            </strong>
          </div>

        </div>


        <div className="detail-item">

          <FaEye />

          <div>
            <small>Visibility</small>

            <strong>
              {weather.visibility !== null
                ? `${weather.visibility} km`
                : "N/A"}
            </strong>
          </div>

        </div>

      </div>


      {/* SUN TIMES */}
      <div className="sun-times">

        <div>

          <FaSun />

          <div>
            <small>Condition</small>

            <strong>
              {weather.description}
            </strong>
          </div>

        </div>


        <div>

          <FaSun />

          <div>
            <small>Location</small>

            <strong>
              {weather.country}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default WeatherCard;