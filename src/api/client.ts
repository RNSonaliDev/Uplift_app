// src/api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://production.iupliftu.com/api/v1';
export const IMAGE_BASE_URL = 'https://production.iupliftu.com';

export const getFullImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

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
      if (config.headers) {
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }
    } else {
      config.body = JSON.stringify(data);
    }
  }

  console.log(`[API REQUEST] ${config.method || 'GET'} ${BASE_URL}${endpoint}`, JSON.stringify(data) ? JSON.stringify(data) : '', config);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const responseText = await response.text();

    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      // responseText is not valid JSON (e.g., HTML error page like 413 or 500 from Nginx)
      responseData = null;
    }

    console.log(`[API RESPONSE] ${response.status} ${BASE_URL}${endpoint}`, responseData ?? responseText);

    if (!response.ok) {
      let errorMessage =
        responseData?.data?.user_message ||
        responseData?.user_message ||
        responseData?.data?.error ||
        responseData?.error ||
        responseData?.message ||
        (Array.isArray(responseData?.errors) ? responseData.errors[0] : responseData?.errors);

      if (!errorMessage) {
        if (response.status === 413) {
          errorMessage = 'The uploaded image is too large. Please select a smaller photo.';
        } else if (response.status === 502 || response.status === 503 || response.status === 504) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if (response.status === 404) {
          errorMessage = 'Requested service endpoint was not found.';
        } else {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }

      throw {
        message: errorMessage,
        status: response.status,
        data: responseData || responseText,
      };
    }

    return (responseData ?? ({} as any)) as T;
  } catch (error: any) {
    console.error(`[API ERROR] ${BASE_URL}${endpoint}`, error);
    // If it's already our custom error format, rethrow it
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    
    // Otherwise, wrap network errors
    throw {
      message: error?.message || 'Failed to connect to the server',
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
