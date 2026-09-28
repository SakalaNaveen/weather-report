import {
  FaLocationDot,
  FaDroplet,
  FaWind,
  FaGaugeHigh,
  FaEye,
  FaCloudRain,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa6";

function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="weather-card">

      {/* TOP */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "800",
            color: "#172554",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaLocationDot
            style={{
              color: "#0eae91",
              fontSize: "24px",
            }}
          />

          {weather.city}, {weather.country || "IN"}
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#10b981",
            fontSize: "14px",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
            }}
          />

          Live
        </div>
      </div>

      {/* TODAY */}
      <p
        style={{
          margin: "0",
          color: "#64748b",
          fontSize: "16px",
        }}
      >
        Today's Weather
      </p>

      {/* MAIN WEATHER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "35px",
          marginTop: "45px",
          marginBottom: "40px",
        }}
      >
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.condition}
          style={{
            width: "90px",
            height: "90px",
          }}
        />

        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "#173b7a",
            lineHeight: "1",
          }}
        >
          {weather.temperature}°C
        </div>

        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#172554",
            }}
          >
            {weather.condition}
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#172554",
              marginTop: "5px",
            }}
          >
            Feels like {weather.feelsLike}°C
          </div>
        </div>
      </div>

      {/* WEATHER DETAILS - ONE LINE */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          borderBottom: "1px solid #e2e8f0",
          padding: "20px 0",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          alignItems: "center",
        }}
      >
        {/* HUMIDITY */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <FaDroplet
            style={{
              color: "#172554",
              fontSize: "18px",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "#172554",
              fontSize: "15px",
              whiteSpace: "nowrap",
            }}
          >
            Humidity{" "}
            <strong>{weather.humidity}%</strong>
          </span>
        </div>

        {/* WIND */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <FaWind
            style={{
              color: "#172554",
              fontSize: "18px",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "#172554",
              fontSize: "15px",
              whiteSpace: "nowrap",
            }}
          >
            Wind Speed{" "}
            <strong>{weather.windSpeed} km/h</strong>
          </span>
        </div>

        {/* PRESSURE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <FaGaugeHigh
            style={{
              color: "#172554",
              fontSize: "18px",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "#172554",
              fontSize: "15px",
              whiteSpace: "nowrap",
            }}
          >
            Pressure{" "}
            <strong>{weather.pressure} hPa</strong>
          </span>
        </div>

        {/* VISIBILITY */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <FaEye
            style={{
              color: "#172554",
              fontSize: "18px",
              flexShrink: 0,
            }}
          />

          <span
            style={{
              color: "#172554",
              fontSize: "15px",
              whiteSpace: "nowrap",
            }}
          >
            Visibility{" "}
            <strong>{weather.visibility} km</strong>
          </span>
        </div>
      </div>

      {/* RAIN / SUN DETAILS - ONE LINE */}
      <div
        style={{
          marginTop: "18px",
          padding: "17px 20px",
          background: "rgba(255,255,255,0.72)",
          borderRadius: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          alignItems: "center",
        }}
      >
        {/* RAIN CHANCE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <FaCloudRain
            style={{
              color: "#f59e0b",
              fontSize: "22px",
            }}
          />

          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#475569",
              }}
            >
              Rain Chance
            </div>

            <strong
              style={{
                fontSize: "16px",
                color: "#172554",
              }}
            >
              {weather.rainChance ?? 0}%
            </strong>
          </div>
        </div>

        {/* SUNRISE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <FaArrowUp
            style={{
              color: "#f59e0b",
              fontSize: "22px",
            }}
          />

          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#475569",
              }}
            >
              Sunrise
            </div>

            <strong
              style={{
                fontSize: "16px",
                color: "#172554",
              }}
            >
              {weather.sunrise || "N/A"}
            </strong>
          </div>
        </div>

        {/* SUNSET */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <FaArrowDown
            style={{
              color: "#f59e0b",
              fontSize: "22px",
            }}
          />

          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#475569",
              }}
            >
              Sunset
            </div>

            <strong
              style={{
                fontSize: "16px",
                color: "#172554",
              }}
            >
              {weather.sunset || "N/A"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;