import axios from "axios";
import { state } from "../store/appContext";

// Backend address can be changed dynamically based on VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor to handle offline-first caching and queuing
api.interceptors.response.use(
  (response) => {
    if (!state.isOnline) state.isOnline = true;
    const config = response.config;
    // Cache successful GET responses
    if (config.method.toLowerCase() === "get" && !config.headers["X-Bypass-Cache"]) {
      try {
        localStorage.setItem("cache_" + config.url, JSON.stringify(response.data));
      } catch (e) {
        console.warn("Failed to save response to cache:", e);
      }
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Check if it's a network/connectivity error (unreachable server)
    const isNetworkError = !error.response || error.code === "ERR_NETWORK" || error.message === "Network Error";

    if (isNetworkError) {
      // Mark global store offline dynamically
      state.isOnline = false;

      const method = config.method.toLowerCase();

      // 1. Handle GET requests from cache
      if (method === "get" && !config.headers["X-Bypass-Cache"]) {
        const cachedData = localStorage.getItem("cache_" + config.url);
        if (cachedData) {
          console.warn(`[Offline Cache] Serving cached data for GET ${config.url}`);
          return Promise.resolve({
            data: JSON.parse(cachedData),
            status: 200,
            statusText: "OK",
            headers: {},
            config: config,
            isCached: true
          });
        } else {
          console.warn(`[Offline Cache] No cache found for GET ${config.url}, returning default empty state`);
          const defaultData = config.url.includes("/me") ? {} : [];
          return Promise.resolve({
            data: defaultData,
            status: 200,
            statusText: "OK",
            headers: {},
            config: config,
            isCached: true
          });
        }
      }

      // 2. Handle writes by queuing them
      const isWriteMethod = ["post", "put", "delete", "patch"].includes(method);
      if (isWriteMethod && !config.headers["X-Bypass-Queue"]) {
        console.warn(`[Offline Queue] Queuing write request ${method.toUpperCase()} ${config.url}`);
        
        try {
          const queue = JSON.parse(localStorage.getItem("offline_requests_queue") || "[]");
          queue.push({
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers,
            timestamp: Date.now()
          });
          localStorage.setItem("offline_requests_queue", JSON.stringify(queue));

          // Sync reactive state
          state.offlineQueue = queue;
        } catch (e) {
          console.error("Failed to queue offline write request:", e);
        }

        // Return mock success response so UI page flows normally
        return Promise.resolve({
          data: {
            id: "OFFLINE_" + Date.now(),
            success: true,
            isOfflineDraft: true,
            message: "Offline saved"
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: config
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
