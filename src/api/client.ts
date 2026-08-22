// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://uplift-backend.pixoatic.com/api/v1';

interface FetchOptions extends RequestInit {
  data?: any;
}

let globalAuthToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  globalAuthToken = token;
};

export const persistAuthToken = async (token: string) => {
  try {
    globalAuthToken = token;
    await AsyncStorage.setItem('UPLIFT_AUTH_TOKEN', token);
  } catch (error) {
    console.error('Failed to save auth token to storage', error);
  }
};

export const loadAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('UPLIFT_AUTH_TOKEN');
    if (token) {
      globalAuthToken = token;
    }
    return token;
  } catch (error) {
    console.error('Failed to load auth token from storage', error);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    globalAuthToken = null;
    await AsyncStorage.removeItem('UPLIFT_AUTH_TOKEN');
  } catch (error) {
    console.error('Failed to clear auth token from storage', error);
  }
};

export const getAuthToken = () => globalAuthToken;

export const apiClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { data, headers, ...customOptions } = options;

  const config: RequestInit = {
    ...customOptions,
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...(globalAuthToken ? { Authorization: `Bearer ${globalAuthToken}` } : {}),
      ...headers,
    },
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
      // Let the browser/fetch automatically set the Content-Type with the boundary
      if (config.headers && 'Content-Type' in (config.headers as any)) {
        delete (config.headers as any)['Content-Type'];
      }
    } else {
      config.body = JSON.stringify(data);
    }
  }

  console.log(`[API REQUEST] ${config.method || 'GET'} ${BASE_URL}${endpoint}`, JSON.stringify(data) ? JSON.stringify(data) : '', config);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const responseData = await response.json();

    console.log(`[API RESPONSE] ${response.status} ${BASE_URL}${endpoint}`, responseData);

    if (!response.ok) {
      throw {
        message: responseData.error || responseData.message || 'An error occurred',
        status: response.status,
        data: responseData,
      };
    }

    return responseData as T;
  } catch (error) {
    console.error(`[API ERROR] ${BASE_URL}${endpoint}`, error);
    // If it's already our custom error format, rethrow it
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Otherwise, wrap network errors
    throw {
      message: 'Failed to connect to the server',
      originalError: error,
    };
  }
};

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) => apiClient<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: any, options?: FetchOptions) => apiClient<T>(endpoint, { ...options, data, method: 'POST' }),
  put: <T>(endpoint: string, data?: any, options?: FetchOptions) => apiClient<T>(endpoint, { ...options, data, method: 'PUT' }),
  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) => apiClient<T>(endpoint, { ...options, data, method: 'PATCH' }),
  delete: <T>(endpoint: string, options?: FetchOptions) => apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
