/**
 * Open-Meteo client. Open-Meteo is a free, key-less weather
 * forecast API (https://open-meteo.com). We poll `current` for
 * temperature, wind, and precipitation at the map's centre.
 *
 * The API call is best-effort: a failure surfaces as a thrown
 * `Error` that the caller (`OpenMeteoWidget`) catches and shows
 * as a "weather data unavailable" placeholder.
 */
export interface CurrentWeather {
  temperatureC: number;
  windKmh: number;
  precipitationMm: number;
  /** ISO-8601 string from Open-Meteo's `current.time`. */
  observedAt: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    time: string;
  };
}

export class OpenMeteoError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'OpenMeteoError';
  }
}

export function buildOpenMeteoUrl(lat: number, lng: number): string {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lng.toFixed(4));
  url.searchParams.set('current', 'temperature_2m,wind_speed_10m,precipitation');
  url.searchParams.set('timezone', 'auto');
  return url.toString();
}

export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<CurrentWeather> {
  const res = await fetch(buildOpenMeteoUrl(lat, lng), { signal });
  if (!res.ok) {
    throw new OpenMeteoError(`open-meteo returned ${res.status}`, res.status);
  }
  const json = (await res.json()) as OpenMeteoResponse;
  if (!json.current) {
    throw new OpenMeteoError('open-meteo payload missing `current`');
  }
  return {
    temperatureC: json.current.temperature_2m,
    windKmh: json.current.wind_speed_10m,
    precipitationMm: json.current.precipitation,
    observedAt: json.current.time,
  };
}
