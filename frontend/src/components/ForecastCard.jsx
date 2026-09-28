import { FaCloudSun } from "react-icons/fa6";

function ForecastCard({ forecast }) {
  const data = forecast || {};

  const dateValue = data.date || data.datetime || data.day || "";

  let dayName = "Day";

  if (dateValue) {
    const date = new Date(dateValue);

    if (!Number.isNaN(date.getTime())) {
      dayName = date.toLocaleDateString("en-US", {
        weekday: "short",
      });
    }
  }

  const temperature =
    data.temperature ??
    data.temp ??
    data.temp_max ??
    data.maxTemp ??
    "--";

  const description =
    data.description ||
    data.weather ||
    data.condition ||
    "Weather";

  const icon = data.icon || "";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "18px 12px",
        minHeight: "155px",
        textAlign: "center",
        boxShadow: "0 8px 22px rgba(45, 90, 120, 0.10)",
        border: "1px solid rgba(30, 120, 150, 0.08)",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "800",
          color: "#17336d",
          marginBottom: "8px",
        }}
      >
        {dayName}
      </div>

      <div
        style={{
          width: "48px",
          height: "48px",
          margin: "0 auto 8px",
          borderRadius: "50%",
          background: "#e9f8f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {icon ? (
          <img
            src={
              icon.startsWith("http")
                ? icon
                : `https://openweathermap.org/img/wn/${icon}@2x.png`
            }
            alt={description}
            style={{
              width: "48px",
              height: "48px",
            }}
          />
        ) : (
          <FaCloudSun
            style={{
              fontSize: "25px",
              color: "#0da99a",
            }}
          />
        )}
      </div>

      <div
        style={{
          fontSize: "23px",
          fontWeight: "800",
          color: "#173b78",
        }}
      >
        {temperature === "--" ? "--" : `${Math.round(Number(temperature))}°C`}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "12px",
          color: "#6a819c",
          textTransform: "capitalize",
        }}
      >
        {description}
      </div>
    </div>
  );
}

export default ForecastCard;