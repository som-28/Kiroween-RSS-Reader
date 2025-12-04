import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { offlineQueue } from './offlineQueue';

// Extend Axios config to include metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
}

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Centralized API client with interceptors and error handling
 */
class ApiClient {
  private client: AxiosInstance;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: ApiClientConfig) {
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (import.meta.env.DEV && response.config.metadata) {
          const duration = new Date().getTime() - response.config.metadata.startTime.getTime();
          console.log(
            `[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`
          );
        }

        return response;
      },
      async (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handle response errors with retry logic
   */
  private async handleResponseError(error: AxiosError): Promise<any> {
    const config = error.config as any;

    // Don't retry if no config or already exceeded retry attempts
    if (!config || config.__retryCount >= this.retryAttempts) {
      return Promise.reject(this.handleError(error));
    }

    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;

    // Determine if we should retry
    const shouldRetry = this.shouldRetry(error);

    if (shouldRetry) {
      config.__retryCount += 1;

      // Calculate exponential backoff delay
      const delay = this.retryDelay * Math.pow(2, config.__retryCount - 1);

      console.log(
        `[API] Retrying request (${config.__retryCount}/${this.retryAttempts}) after ${delay}ms:`,
        config.url
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request
      return this.client(config);
    }

    return Promise.reject(this.handleError(error));
  }

  /**
   * Determine if a request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Don't retry if request was cancelled
    if (axios.isCancel(error)) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on specific status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.response.status);
  }

  /**
   * Handle and transform errors
   */
  private handleError(error: any): ApiError {
    if (axios.isCancel(error)) {
      return new ApiError('Request cancelled', undefined, 'REQUEST_CANCELLED');
    }

    if (error instanceof AxiosError) {
      const response = error.response;

      if (response) {
        // Server responded with error
        const message = response.data?.message || response.data?.error || error.message;
        const code = response.data?.code || `HTTP_${response.status}`;

        return new ApiError(message, response.status, code, response.data);
      } else if (error.request) {
        // Request made but no response
        return new ApiError(
          'No response from server. Please check your internet connection.',
          undefined,
          'NETWORK_ERROR'
        );
      }
    }

    // Unknown error
    return new ApiError(
      error.message || 'An unexpected error occurred',
      undefined,
      'UNKNOWN_ERROR'
    );
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    // TODO: Implement token retrieval from localStorage or other storage
    // For now, return null as authentication is not implemented
    return null;
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Queue if offline (unless explicitly disabled)
    if (!navigator.onLine && !(config as any)?.skipOfflineQueue) {
      offlineQueue.enqueue('POST', url, data);
      throw new ApiError('Operation queued for sync when online', undefined, 'QUEUED_OFFLINE');
    }

    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Queue if offline (unless explicitly disabled)
    if (!navigator.onLine && !(config as any)?.skipOfflineQueue) {
      offlineQueue.enqueue('PUT', url, data);
      throw new ApiError('Operation queued for sync when online', undefined, 'QUEUED_OFFLINE');
    }

    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Queue if offline (unless explicitly disabled)
    if (!navigator.onLine && !(config as any)?.skipOfflineQueue) {
      offlineQueue.enqueue('PATCH', url, data);
      throw new ApiError('Operation queued for sync when online', undefined, 'QUEUED_OFFLINE');
    }

    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Queue if offline (unless explicitly disabled)
    if (!navigator.onLine && !(config as any)?.skipOfflineQueue) {
      offlineQueue.enqueue('DELETE', url);
      throw new ApiError('Operation queued for sync when online', undefined, 'QUEUED_OFFLINE');
    }

    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

/**
 * Create and export the default API client instance
 */
import { API_CONFIG } from '../config/api';

export const apiClient = new ApiClient({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: API_CONFIG.RETRY_DELAY,
});

/**
 * Export axios instance for backward compatibility
 */
export const axiosInstance = apiClient.getAxiosInstance();
