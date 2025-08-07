import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "../redux/store";
import { clearCredentials } from "../redux/slices/authSlice";
import { addNotification } from "../redux/slices/uiSlice";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): any => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const { response, request } = error;

    if (response) {
      // Handle specific error status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear credentials and redirect to login
          store.dispatch(clearCredentials());
          store.dispatch(
            addNotification({
              type: "error",
              title: "Authentication Error",
              message: "Your session has expired. Please log in again.",
            })
          );
          break;

        case 403:
          // Forbidden
          store.dispatch(
            addNotification({
              type: "error",
              title: "Access Denied",
              message: "You don't have permission to access this resource.",
            })
          );
          break;

        case 404:
          // Not found
          store.dispatch(
            addNotification({
              type: "error",
              title: "Not Found",
              message: "The requested resource was not found.",
            })
          );
          break;

        case 422:
          // Validation error - don't show notification as it's handled by forms
          break;

        case 429:
          // Too many requests
          store.dispatch(
            addNotification({
              type: "warning",
              title: "Rate Limited",
              message: "Too many requests. Please try again later.",
            })
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          store.dispatch(
            addNotification({
              type: "error",
              title: "Server Error",
              message:
                "Something went wrong on our end. Please try again later.",
            })
          );
          break;

        default:
          // Generic error
          const errorMessage =
            response.data?.message || "An unexpected error occurred";
          store.dispatch(
            addNotification({
              type: "error",
              title: "Error",
              message: errorMessage,
            })
          );
      }
    } else if (request) {
      // Network error
      store.dispatch(
        addNotification({
          type: "error",
          title: "Network Error",
          message:
            "Unable to connect to the server. Please check your internet connection.",
        })
      );
    }

    return Promise.reject(error);
  }
);

// Main API helper - standardized axios interface
export const api = {
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.get(url, config);
    return response.data;
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post(url, data, config);
    return response.data;
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put(url, data, config);
    return response.data;
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch(url, data, config);
    return response.data;
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.delete(url, config);
    return response.data;
  },
};

export { apiClient };
export default api;
