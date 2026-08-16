import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OpenMeteoError,
  buildOpenMeteoUrl,
  fetchCurrentWeather,
} from './weatherApi';

const SAMPLE_RESPONSE = {
  current: {
    temperature_2m: 24.7,
    wind_speed_10m: 11.3,
    precipitation: 0.0,
    time: '2026-08-15T18:00',
  },
};

describe('buildOpenMeteoUrl', () => {
  it('builds a URL with latitude, longitude, current fields, and timezone', () => {
    const url = buildOpenMeteoUrl(-22.0, -47.0);
    expect(url).toContain('https://api.open-meteo.com/v1/forecast');
    expect(url).toContain('latitude=-22.0000');
    expect(url).toContain('longitude=-47.0000');
    expect(url).toContain('current=temperature_2m%2Cwind_speed_10m%2Cprecipitation');
    expect(url).toContain('timezone=auto');
  });
});

describe('fetchCurrentWeather', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => SAMPLE_RESPONSE,
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a mapped CurrentWeather on 200', async () => {
    const data = await fetchCurrentWeather(-22, -47);
    expect(data).toEqual({
      temperatureC: 24.7,
      windKmh: 11.3,
      precipitationMm: 0.0,
      observedAt: '2026-08-15T18:00',
    });
  });

  it('passes the abort signal to fetch', async () => {
    const controller = new AbortController();
    await fetchCurrentWeather(-22, -47, controller.signal);
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal: controller.signal }));
  });

  it('throws an OpenMeteoError on non-2xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );
    await expect(fetchCurrentWeather(-22, -47)).rejects.toBeInstanceOf(OpenMeteoError);
  });

  it('throws when the payload is missing `current`', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    );
    await expect(fetchCurrentWeather(-22, -47)).rejects.toThrow(/current/);
  });
});
