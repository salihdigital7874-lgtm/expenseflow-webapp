// Centralized API Client Service Layer for POCO Android Backend Server

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();

export const TOKEN_KEY = 'salihport_auth_token';
export const USER_KEY = 'salihport_auth_user';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): any | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export interface ApiError {
  message: string;
  status?: number;
  isOffline?: boolean;
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      removeToken();
      window.dispatchEvent(new Event('auth_session_expired'));
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.error || 'Session expired. Please log in again.',
        status: 401,
      } as ApiError;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.error || `Server returned status ${response.status}`,
        status: response.status,
      } as ApiError;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err.status) {
      throw err;
    }
    // Network or Server Offline error
    console.error('❌ Network / Phone Server Connection Error:', err);
    throw {
      message: 'Unable to connect to POCO Phone Server. Please verify the phone is online and Termux backend is running.',
      isOffline: true,
    } as ApiError;
  }
}
