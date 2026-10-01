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
   LOCATION SEARCH CACHE + REQUEST CONTROL
========================================================= */

const locationCache = new Map();

const LOCATION_CACHE_TIME = 10 * 60 * 1000;

// Nominatim public service should not receive rapid requests.
let lastNominatimRequestTime = 0;
let nominatimQueue = Promise.resolve();

function waitForNominatimSlot() {
  const task = nominatimQueue.then(async () => {
    const now = Date.now();
    const elapsed = now - lastNominatimRequestTime;

    if (elapsed < 1100) {
      await new Promise((resolve) =>
        setTimeout(resolve, 1100 - elapsed)
      );
    }

    lastNominatimRequestTime = Date.now();
  });

  nominatimQueue = task.catch(() => {});

  return task;
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

    const normalizedQuery = query.toLowerCase();

    /* =====================================================
       CACHE
    ===================================================== */

    const cached = locationCache.get(normalizedQuery);

    if (
      cached &&
      Date.now() - cached.timestamp < LOCATION_CACHE_TIME
    ) {
      return res.json({
        success: true,
        locations: cached.locations,
      });
    }

    /* =====================================================
       WAIT BEFORE Nominatim REQUEST
    ===================================================== */

    await waitForNominatimSlot();

    /* =====================================================
       NOMINATIM SEARCH
    ===================================================== */

    const nominatimResponse = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: `${query}, India`,
          format: "jsonv2",
          addressdetails: 1,
          limit: 50,
          countrycodes: "in",
          dedupe: 0,
          "accept-language": "en",
        },
        headers: {
          "User-Agent":
            "WeatherReportApp/1.0 (location search)",
        },
        timeout: 10000,
      }
    );

    const results = Array.isArray(nominatimResponse.data)
      ? nominatimResponse.data
      : [];

    /* =====================================================
       CONVERT RESULTS
       IMPORTANT:
       Do NOT call reverse Nominatim or Overpass here.
       This keeps autocomplete fast and stable.
    ===================================================== */

    const locations = results.map((place) => {
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
        address.locality ||
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

      const county = String(
        address.county || ""
      ).trim();

      /*
        In many Andhra Pradesh locations,
        OSM stores the mandal in county.
      */

      if (
        !mandal &&
        county &&
        county.toLowerCase() !==
          district.toLowerCase()
      ) {
        mandal = county;
      }

      return {
        id: place.place_id,

        name: String(name).trim(),

        city: String(
          address.city ||
            address.town ||
            address.municipality ||
            ""
        ).trim(),

        mandal: String(mandal || "").trim(),

        district: String(district).trim(),

        state: String(state).trim(),

        country: address.country || "India",

        countryCode: String(
          address.country_code || "in"
        ).toUpperCase(),

        latitude,

        longitude,

        type: place.type || "",
      };
    });

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

       1. Exact name
       2. Starts with query
       3. Contains query
    ===================================================== */

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

      const scoreDifference =
        getScore(aName) - getScore(bName);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return aName.localeCompare(bName);
    });

    const finalLocations =
      uniqueLocations.slice(0, 10);

    /* =====================================================
       SAVE IN CACHE
    ===================================================== */

    locationCache.set(normalizedQuery, {
      timestamp: Date.now(),
      locations: finalLocations,
    });

    /* =====================================================
       CLEAN OLD CACHE ENTRIES
    ===================================================== */

    if (locationCache.size > 100) {
      const oldestKey =
        locationCache.keys().next().value;

      if (oldestKey) {
        locationCache.delete(oldestKey);
      }
    }

    return res.json({
      success: true,
      locations: finalLocations,
    });
  } catch (error) {
    console.error(
      "Location search error:",
      error.response?.data ||
        error.message
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
    const city = String(
      req.query.city || ""
    ).trim();

    const lat = req.query.lat;
    const lon = req.query.lon;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({
        success: false,
        message:
          "City name or coordinates are required",
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
      const forecastResponse =
        await axios.get(
          "https://api.openweathermap.org/data/2.5/forecast",
          {
            params,
            timeout: 15000,
          }
        );

      const firstForecast =
        forecastResponse.data?.list?.[0];

      if (
        firstForecast?.pop !== undefined
      ) {
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

      country:
        weather.sys?.country || "",

      temperature: Math.round(
        weather.main?.temp ?? 0
      ),

      feelsLike: Math.round(
        weather.main?.feels_like ?? 0
      ),

      humidity:
        weather.main?.humidity ?? 0,

      windSpeed:
        Math.round(
          ((weather.wind?.speed ?? 0) *
            3.6) *
            10
        ) / 10,

      pressure:
        weather.main?.pressure ?? 0,

      visibility:
        Math.round(
          (weather.visibility ?? 0) /
            100
        ) / 10,

      condition:
        weather.weather?.[0]?.main || "",

      description:
        weather.weather?.[0]
          ?.description || "",

      icon:
        weather.weather?.[0]?.icon || "",

      rain:
        Math.round(
          rainAmount * 10
        ) / 10,

      rainChance,

      sunrise: weather.sys?.sunrise
        ? new Date(
            weather.sys.sunrise * 1000
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          )
        : "",

      sunset: weather.sys?.sunset
        ? new Date(
            weather.sys.sunset * 1000
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          )
        : "",
    });
  } catch (error) {
    console.error(
      "Weather API error:",
      error.response?.data ||
        error.message
    );

    const status =
      error.response?.status || 500;

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

app.get(
  "/api/weather/forecast",
  async (req, res) => {
    try {
      const city = String(
        req.query.city || ""
      ).trim();

      const lat = req.query.lat;
      const lon = req.query.lon;

      if (!city && (!lat || !lon)) {
        return res.status(400).json({
          success: false,
          message:
            "City name or coordinates are required",
        });
      }

      if (!process.env.WEATHER_API_KEY) {
        return res.status(500).json({
          success: false,
          message:
            "WEATHER_API_KEY is missing",
        });
      }

      const params = {
        appid:
          process.env.WEATHER_API_KEY,
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

      const list =
        response.data?.list || [];

      const grouped = {};

      list.forEach((item) => {
        const date =
          item.dt_txt?.split(" ")[0];

        if (!date) return;

        if (!grouped[date]) {
          grouped[date] = [];
        }

        grouped[date].push(item);
      });

      const forecast =
        Object.entries(grouped)
          .slice(0, 5)
          .map(([date, items]) => {
            const temperatures =
              items.map(
                (item) =>
                  item.main?.temp ?? 0
              );

            const first = items[0];

            const rainChance =
              Math.round(
                Math.max(
                  ...items.map(
                    (item) =>
                      (item.pop || 0) *
                      100
                  )
                )
              );

            return {
              date,

              maxTemp: Math.round(
                Math.max(
                  ...temperatures
                )
              ),

              minTemp: Math.round(
                Math.min(
                  ...temperatures
                )
              ),

              condition:
                first.weather?.[0]
                  ?.main || "",

              description:
                first.weather?.[0]
                  ?.description || "",

              icon:
                first.weather?.[0]
                  ?.icon || "",

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
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch forecast",
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});