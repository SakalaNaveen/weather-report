const GEOLOCATION_API =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
  "https://api.open-meteo.com/v1/forecast";

export async function getWeather(city) {
  try {
    // Step 1: Find city coordinates
    const locationResponse = await fetch(
      `${GEOLOCATION_API}?name=${encodeURIComponent(
        city
      )}&count=1&language=en&format=json`
    );

    if (!locationResponse.ok) {
      throw new Error("Unable to find the city");
    }

    const locationData = await locationResponse.json();

    if (
      !locationData.results ||
      locationData.results.length === 0
    ) {
      throw new Error("City not found");
    }

    const location = locationData.results[0];

    const latitude = location.latitude;
    const longitude = location.longitude;

    // Step 2: Get weather information
    const weatherResponse = await fetch(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error("Unable to get weather data");
    }

    const weatherData = await weatherResponse.json();

    return {
      city: location.name,
      country: location.country,
      temperature: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: weatherData.current.wind_speed_10m,
      weatherCode: weatherData.current.weather_code,

      forecast: weatherData.daily.time.map(
        (date, index) => ({
          date: date,
          weatherCode: weatherData.daily.weather_code[index],
          maxTemperature:
            weatherData.daily.temperature_2m_max[index],
          minTemperature:
            weatherData.daily.temperature_2m_min[index],
        })
      ),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}