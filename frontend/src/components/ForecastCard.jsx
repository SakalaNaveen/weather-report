function ForecastCard({
  day,
  date,
  icon,
  max,
  min,
  condition,
}) {
  return (
    <div className="forecast-card">

      <h3>{day}</h3>

      <span className="forecast-date">
        {date}
      </span>

      <div className="forecast-icon">
        {icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={condition}
          />
        ) : (
          <span>🌤️</span>
        )}
      </div>

      <div className="forecast-temperature">

        <strong>
          {max}°C
        </strong>

        <span>
          / {min}°C
        </span>

      </div>

      <p>
        {condition}
      </p>

    </div>
  );
}

export default ForecastCard;