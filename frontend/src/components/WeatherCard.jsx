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
    <>
      <style>
        {`
          /* =========================================
             MOBILE RESPONSIVE FIX ONLY
             DESKTOP DESIGN IS NOT CHANGED
          ========================================= */

          @media (max-width: 600px) {

            .weather-card {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }

            /* TOP LOCATION */
            .weather-card .weather-top {
              gap: 10px !important;
            }

            .weather-card .weather-location {
              font-size: 24px !important;
              line-height: 1.2 !important;
              min-width: 0 !important;
              word-break: normal !important;
            }

            .weather-card .weather-location-icon {
              font-size: 22px !important;
              flex-shrink: 0 !important;
            }

            .weather-card .weather-live {
              flex-shrink: 0 !important;
              font-size: 13px !important;
            }

            /* MAIN WEATHER */
            .weather-card .weather-main {
              display: grid !important;
              grid-template-columns: 65px minmax(0, 1fr) 95px !important;
              align-items: center !important;
              gap: 8px !important;
              margin-top: 35px !important;
              margin-bottom: 30px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .weather-card .weather-icon {
              width: 65px !important;
              height: 65px !important;
              object-fit: contain !important;
            }

            .weather-card .weather-temperature {
              font-size: 48px !important;
              line-height: 1 !important;
              white-space: nowrap !important;
            }

            .weather-card .weather-condition {
              min-width: 0 !important;
              overflow-wrap: break-word !important;
            }

            .weather-card .weather-condition-name {
              font-size: 18px !important;
              line-height: 1.2 !important;
              word-break: break-word !important;
            }

            .weather-card .weather-feels {
              font-size: 14px !important;
              line-height: 1.3 !important;
              margin-top: 4px !important;
              word-break: break-word !important;
            }

            /* WEATHER DETAILS */
            .weather-card .weather-details {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 14px 10px !important;
              padding: 17px 0 !important;
              width: 100% !important;
            }

            .weather-card .weather-detail-item {
              min-width: 0 !important;
              width: 100% !important;
            }

            .weather-card .weather-detail-text {
              font-size: 13px !important;
              white-space: normal !important;
              line-height: 1.3 !important;
              min-width: 0 !important;
            }

            .weather-card .weather-detail-icon {
              font-size: 17px !important;
              flex-shrink: 0 !important;
            }

            /* RAIN / SUN */
            .weather-card .weather-sun-details {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 6px !important;
              padding: 15px 8px !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }

            .weather-card .weather-sun-item {
              min-width: 0 !important;
              gap: 6px !important;
            }

            .weather-card .weather-sun-icon {
              font-size: 19px !important;
              flex-shrink: 0 !important;
            }

            .weather-card .weather-sun-label {
              font-size: 12px !important;
              line-height: 1.25 !important;
              word-break: break-word !important;
            }

            .weather-card .weather-sun-value {
              font-size: 15px !important;
              line-height: 1.2 !important;
              word-break: break-word !important;
            }
          }

          /* VERY SMALL MOBILE SCREENS */
          @media (max-width: 380px) {

            .weather-card .weather-location {
              font-size: 21px !important;
            }

            .weather-card .weather-main {
              grid-template-columns: 55px minmax(0, 1fr) 82px !important;
              gap: 5px !important;
            }

            .weather-card .weather-icon {
              width: 55px !important;
              height: 55px !important;
            }

            .weather-card .weather-temperature {
              font-size: 42px !important;
            }

            .weather-card .weather-condition-name {
              font-size: 16px !important;
            }

            .weather-card .weather-feels {
              font-size: 13px !important;
            }

            .weather-card .weather-detail-text {
              font-size: 12px !important;
            }

            .weather-card .weather-sun-label {
              font-size: 11px !important;
            }

            .weather-card .weather-sun-value {
              font-size: 14px !important;
            }
          }
        `}
      </style>

      <div className="weather-card">

        {/* TOP */}
        <div
          className="weather-top"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h2
            className="weather-location"
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
              className="weather-location-icon"
              style={{
                color: "#0eae91",
                fontSize: "24px",
              }}
            />

            {weather.city}, {weather.country || "IN"}
          </h2>

          <div
            className="weather-live"
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
          className="weather-main"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "35px",
            marginTop: "45px",
            marginBottom: "40px",
          }}
        >
          <img
            className="weather-icon"
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
            style={{
              width: "90px",
              height: "90px",
            }}
          />

          <div
            className="weather-temperature"
            style={{
              fontSize: "64px",
              fontWeight: "800",
              color: "#173b7a",
              lineHeight: "1",
            }}
          >
            {weather.temperature}°C
          </div>

          <div className="weather-condition">
            <div
              className="weather-condition-name"
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#172554",
              }}
            >
              {weather.condition}
            </div>

            <div
              className="weather-feels"
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

        {/* WEATHER DETAILS */}
        <div
          className="weather-details"
          style={{
            borderTop: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0",
            padding: "20px 0",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            alignItems: "center",
          }}
        >

          {/* HUMIDITY */}
          <div
            className="weather-detail-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
            }}
          >
            <FaDroplet
              className="weather-detail-icon"
              style={{
                color: "#172554",
                fontSize: "18px",
                flexShrink: 0,
              }}
            />

            <span
              className="weather-detail-text"
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
            className="weather-detail-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              minWidth: 0,
            }}
          >
            <FaWind
              className="weather-detail-icon"
              style={{
                color: "#172554",
                fontSize: "18px",
                flexShrink: 0,
              }}
            />

            <span
              className="weather-detail-text"
              style={{
                color: "#172554",
                fontSize: "15px",
                whiteSpace: "normal",
              }}
            >
              Wind Speed{" "}
              <strong>{weather.windSpeed} km/h</strong>
            </span>
          </div>

          {/* PRESSURE */}
          <div
            className="weather-detail-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
            }}
          >
            <FaGaugeHigh
              className="weather-detail-icon"
              style={{
                color: "#172554",
                fontSize: "18px",
                flexShrink: 0,
              }}
            />

            <span
              className="weather-detail-text"
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
            className="weather-detail-item"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
            }}
          >
            <FaEye
              className="weather-detail-icon"
              style={{
                color: "#172554",
                fontSize: "18px",
                flexShrink: 0,
              }}
            />

            <span
              className="weather-detail-text"
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

        {/* RAIN / SUN DETAILS */}
        <div
          className="weather-sun-details"
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
            className="weather-sun-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaCloudRain
              className="weather-sun-icon"
              style={{
                color: "#f59e0b",
                fontSize: "22px",
              }}
            />

            <div>
              <div
                className="weather-sun-label"
                style={{
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                Rain Chance
              </div>

              <strong
                className="weather-sun-value"
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
            className="weather-sun-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaArrowUp
              className="weather-sun-icon"
              style={{
                color: "#f59e0b",
                fontSize: "22px",
              }}
            />

            <div>
              <div
                className="weather-sun-label"
                style={{
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                Sunrise
              </div>

              <strong
                className="weather-sun-value"
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
            className="weather-sun-item"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <FaArrowDown
              className="weather-sun-icon"
              style={{
                color: "#f59e0b",
                fontSize: "22px",
              }}
            />

            <div>
              <div
                className="weather-sun-label"
                style={{
                  fontSize: "14px",
                  color: "#475569",
                }}
              >
                Sunset
              </div>

              <strong
                className="weather-sun-value"
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
    </>
  );
}

export default WeatherCard;