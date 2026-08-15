import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

/**
 * Singleton axios instance for the whole app.
 *
 * The JWT interceptor reads from the Zustand store on every request
 * (not from localStorage) so that a `clear()` in one tab is
 * reflected in the very next request from this tab.
 */
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/** Tiny helper for code that wants to read the base URL (e.g. tests). */
export function getApiBaseUrl(): string {
  return BASE_URL;
}
