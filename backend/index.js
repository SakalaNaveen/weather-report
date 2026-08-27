const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// HOME
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Weather Report Backend is running successfully!",
  });
});

// CURRENT WEATHER
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({
      success: false,
      message: "City name is required",
    });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const data = response.data;

    res.json({
      success: true,
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6),
      pressure: data.main.pressure,
      visibility: data.visibility
        ? Math.round(data.visibility / 1000)
        : null,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    });
  } catch (error) {
    console.log("CURRENT WEATHER ERROR:", error.message);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch weather data",
    });
  }
});

// 5-DAY FORECAST
app.get("/api/weather/forecast", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({
      success: false,
      message: "City name is required",
    });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: city,
          appid: process.env.WEATHER_API_KEY,
          units: "metric",
        },
      }
    );

    const data = response.data;

    const daily = {};

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];

      if (!daily[date]) {
        daily[date] = [];
      }

      daily[date].push(item);
    });

    const forecast = Object.keys(daily)
      .slice(0, 5)
      .map((date) => {
        const items = daily[date];

        const temps = items.map((item) => item.main.temp);

        const max = Math.round(Math.max(...temps));
        const min = Math.round(Math.min(...temps));

        const selected =
          items.find((item) =>
            item.dt_txt.includes("12:00:00")
          ) || items[0];

        const dateObject = new Date(`${date}T12:00:00`);

        const day = dateObject.toLocaleDateString("en-US", {
          weekday: "short",
        });

        return {
          date,
          day,
          max,
          min,
          condition: selected.weather[0].main,
          description: selected.weather[0].description,
          icon: selected.weather[0].icon,
        };
      });

    res.json({
      success: true,
      city: data.city.name,
      country: data.city.country,
      forecast,
    });
  } catch (error) {
    console.log("FORECAST ERROR:", error.message);

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch forecast data",
    });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});