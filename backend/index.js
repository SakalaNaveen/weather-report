const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Weather Report Backend is running successfully!",
  });
});

/* =========================================================
   GET MANDAL FROM OPENSTREETMAP
   FAST VERSION
========================================================= */

const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function getMandalFromCoordinates(latitude, longitude) {
  const query = `
    [out:json][timeout:5];
    is_in(${latitude},${longitude});
    rel(pivot._)
      ["boundary"="administrative"]
      ["admin_level"="6"];
    out tags;
  `;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await axios.get(server, {
        params: {
          data: query,
        },
        timeout: 6000,
        headers: {
          "User-Agent": "WeatherReportApp/1.0",
        },
      });

      const elements = response.data?.elements || [];

      if (elements.length > 0) {
        const tags = elements[0].tags || {};

        let mandal =
          tags["name:en"] ||
          tags.name ||
          tags["official_name:en"] ||
          tags.official_name ||
          "";

        if (mandal) {
          mandal = mandal
            .replace(/\s+mandal$/i, "")
            .replace(/\s+tehsil$/i, "")
            .replace(/\s+taluk$/i, "")
            .replace(/\s+taluka$/i, "")
            .trim();

          return mandal;
        }
      }
    } catch (error) {
      console.log(
        "Overpass server skipped:",
        server,
        error.code || error.message
      );
    }
  }

  return "";
}

/* =========================================================
   GET MANDAL FROM NOMINATIM REVERSE
   This is tried before Overpass because it is faster.
========================================================= */

async function getMandalFromNominatim(latitude, longitude) {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "jsonv2",
          addressdetails: 1,
          zoom: 18,
          "accept-language": "en",
        },
        headers: {
          "User-Agent": "WeatherReportApp/1.0",
        },
        timeout: 5000,
      }
    );

    const address = response.data?.address || {};

    const district =
      address.state_district ||
      address.district ||
      "";

    const possibleMandal =
      address.subdistrict ||
      address.city_district ||
      "";

    if (possibleMandal) {
      return possibleMandal
        .replace(/\s+mandal$/i, "")
        .replace(/\s+tehsil$/i, "")
        .replace(/\s+taluk$/i, "")
        .replace(/\s+taluka$/i, "")
        .trim();
    }

    const county = String(address.county || "").trim();

    if (
      county &&
      county.toLowerCase() !== district.toLowerCase()
    ) {
      return county
        .replace(/\s+mandal$/i, "")
        .replace(/\s+tehsil$/i, "")
        .replace(/\s+taluk$/i, "")
        .replace(/\s+taluka$/i, "")
        .trim();
    }

    return "";
  } catch (error) {
    console.log(
      "Nominatim reverse mandal lookup skipped:",
      error.code || error.message
    );

    return "";
  }
}

/* =========================================================
   LOCATION SEARCH
   Village / City + Mandal + District + State
========================================================= */

app.get("/api/locations", async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();

    if (!query) {
      return res.json({
        success: true,
        locations: [],
      });
    }

    const nominatimResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${query}, India`,
          format: "jsonv2",
          addressdetails: 1,

          // Increased so matching villages/places
          // are available before ranking.
          limit: 50,

          countrycodes: "in",

          dedupe: 0,

          "accept-language": "en",
        },
        headers: {
          "User-Agent": "WeatherReportApp/1.0",
        },
        timeout: 8000,
      }
    );

    const results = nominatimResponse.data || [];

    const locations = await Promise.all(
      results.map(async (place) => {
        const address = place.address || {};

        const latitude = Number(place.lat);
        const longitude = Number(place.lon);

        const name =
          address.village ||
          address.town ||
          address.city ||
          address.municipality ||
          address.suburb ||
          address.hamlet ||
          place.name ||
          place.display_name?.split(",")[0] ||
          "";

        const district =
          address.state_district ||
          address.district ||
          "";

        const state = address.state || "";

        let mandal =
          address.subdistrict ||
          address.city_district ||
          "";

        const county = String(address.county || "").trim();

        if (
          !mandal &&
          county &&
          county.toLowerCase() !== district.toLowerCase()
        ) {
          mandal = county;
        }

        if (
          !mandal &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          mandal = await getMandalFromNominatim(
            latitude,
            longitude
          );
        }

        if (
          !mandal &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          mandal = await getMandalFromCoordinates(
            latitude,
            longitude
          );
        }

        return {
          id: place.place_id,

          name: name.trim(),

          city: (
            address.city ||
            address.town ||
            address.municipality ||
            ""
          ).trim(),

          mandal: String(mandal || "").trim(),

          district: district.trim(),

          state: state.trim(),

          country: address.country || "India",

          countryCode: (
            address.country_code || "in"
          ).toUpperCase(),

          latitude,

          longitude,

          type: place.type || "",
        };
      })
    );

    /* =====================================================
       INDIA ONLY
    ===================================================== */

    const validLocations = locations.filter(
      (place) =>
        place.name &&
        Number.isFinite(place.latitude) &&
        Number.isFinite(place.longitude) &&
        place.countryCode === "IN"
    );

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const uniqueLocations = [];

    const seen = new Set();

    for (const place of validLocations) {
      const key = [
        place.name.toLowerCase(),
        place.mandal.toLowerCase(),
        place.district.toLowerCase(),
        place.state.toLowerCase(),
        place.latitude,
        place.longitude,
      ].join("|");

      if (!seen.has(key)) {
        seen.add(key);
        uniqueLocations.push(place);
      }
    }

    /* =====================================================
       SEARCH RANKING

       1. Exact name match
       2. Name starts with typed text
       3. Name contains typed text
    ===================================================== */

    const normalizedQuery = query.toLowerCase();

    uniqueLocations.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const getScore = (name) => {
        if (name === normalizedQuery) {
          return 0;
        }

        if (name.startsWith(normalizedQuery)) {
          return 1;
        }

        if (name.includes(normalizedQuery)) {
          return 2;
        }

        return 3;
      };

      return getScore(aName) - getScore(bName);
    });

    return res.json({
      success: true,
      locations: uniqueLocations.slice(0, 10),
    });
  } catch (error) {
    console.error(
      "Location search error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search locations",
      locations: [],
    });
  }
});

/* =========================================================
   WEATHER API
========================================================= */

app.get("/api/weather", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();

    const lat = req.query.lat;
    const lon = req.query.lon;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: "City name or coordinates are required",
      });
    }

    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "WEATHER_API_KEY is missing",
      });
    }

    const params = {
      appid: process.env.WEATHER_API_KEY,
      units: "metric",
    };

    if (
      lat !== undefined &&
      lon !== undefined &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lon))
    ) {
      params.lat = Number(lat);
      params.lon = Number(lon);
    } else {
      params.q = city;
    }

    const weatherResponse = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params,
        timeout: 15000,
      }
    );

    const weather = weatherResponse.data;

    const rainAmount =
      weather.rain?.["1h"] ??
      (weather.rain?.["3h"]
        ? weather.rain["3h"] / 3
        : 0);

    let rainChance = 0;

    try {
      const forecastResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        {
          params,
          timeout: 15000,
        }
      );

      const firstForecast =
        forecastResponse.data?.list?.[0];

      if (firstForecast?.pop !== undefined) {
        rainChance = Math.round(
          firstForecast.pop * 100
        );
      }
    } catch (forecastError) {
      console.log(
        "Rain chance error:",
        forecastError.response?.data ||
          forecastError.message
      );
    }

    return res.json({
      success: true,

      city: weather.name,

      country: weather.sys?.country || "",

      temperature: Math.round(
        weather.main?.temp ?? 0
      ),

      feelsLike: Math.round(
        weather.main?.feels_like ?? 0
      ),

      humidity: weather.main?.humidity ?? 0,

      windSpeed:
        Math.round(
          ((weather.wind?.speed ?? 0) * 3.6) * 10
        ) / 10,

      pressure: weather.main?.pressure ?? 0,

      visibility:
        Math.round(
          (weather.visibility ?? 0) / 100
        ) / 10,

      condition:
        weather.weather?.[0]?.main || "",

      description:
        weather.weather?.[0]?.description || "",

      icon:
        weather.weather?.[0]?.icon || "",

      rain:
        Math.round(rainAmount * 10) / 10,

      rainChance,

      sunrise: weather.sys?.sunrise
        ? new Date(
            weather.sys.sunrise * 1000
          ).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",

      sunset: weather.sys?.sunset
        ? new Date(
            weather.sys.sunset * 1000
          ).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "",
    });
  } catch (error) {
    console.error(
      "Weather API error:",
      error.response?.data || error.message
    );

    const status = error.response?.status || 500;

    return res.status(status).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Unable to fetch weather",
    });
  }
});

/* =========================================================
   5-DAY FORECAST
========================================================= */

app.get("/api/weather/forecast", async (req, res) => {
  try {
    const city = String(req.query.city || "").trim();

    const lat = req.query.lat;
    const lon = req.query.lon;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message: "City name or coordinates are required",
      });
    }

    if (!process.env.WEATHER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "WEATHER_API_KEY is missing",
      });
    }

    const params = {
      appid: process.env.WEATHER_API_KEY,
      units: "metric",
    };

    if (
      lat !== undefined &&
      lon !== undefined &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lon))
    ) {
      params.lat = Number(lat);
      params.lon = Number(lon);
    } else {
      params.q = city;
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params,
        timeout: 15000,
      }
    );

    const list = response.data?.list || [];

    const grouped = {};

    list.forEach((item) => {
      const date = item.dt_txt?.split(" ")[0];

      if (!date) return;

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(item);
    });

    const forecast = Object.entries(grouped)
      .slice(0, 5)
      .map(([date, items]) => {
        const temperatures = items.map(
          (item) => item.main?.temp ?? 0
        );

        const first = items[0];

        const rainChance = Math.round(
          Math.max(
            ...items.map(
              (item) => (item.pop || 0) * 100
            )
          )
        );

        return {
          date,

          maxTemp: Math.round(
            Math.max(...temperatures)
          ),

          minTemp: Math.round(
            Math.min(...temperatures)
          ),

          condition:
            first.weather?.[0]?.main || "",

          description:
            first.weather?.[0]?.description || "",

          icon:
            first.weather?.[0]?.icon || "",

          rainChance,
        };
      });

    return res.json({
      success: true,
      forecast,
    });
  } catch (error) {
    console.error(
      "Forecast API error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch forecast",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});