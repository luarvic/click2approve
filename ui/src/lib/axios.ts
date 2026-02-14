import axios from "axios";
import { API_BASE_URI, API_TIMEOUT_MS } from "../data/constants";
import { stores } from "../stores/stores";
import { getLoaderName } from "../utils/helpers";
import { accountRefresh } from "./controllers/auth";
import { readTokens } from "./session";

const axiosInstance = axios.create({
  baseURL: API_BASE_URI,
  timeout: API_TIMEOUT_MS,
});

axiosInstance.defaults.baseURL = API_BASE_URI;
axiosInstance.interceptors.request.use(async (config) => {
  config.url &&
    stores.commonStore.updateLoadingCounter(getLoaderName(config), 1);
  const tokens = readTokens();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
axiosInstance.interceptors.response.use(
  async (response) => {
    response.config.url &&
      stores.commonStore.updateLoadingCounter(
        getLoaderName(response.config),
        -1
      );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest?.url) {
      stores.commonStore.updateLoadingCounter(
        getLoaderName(originalRequest),
        -1
      );
    }
    // Try refreshing access token on 401 status code.
    if (
      error.response &&
      error.response.status &&
      error.response.status === 401 &&
      originalRequest.url !== "api/account/refresh" &&
      !originalRequest.url.startsWith("api/account/confirmEmail")
    ) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const tokens = readTokens();
        if (tokens) {
          const newTokens = await accountRefresh(tokens.refreshToken);
          if (newTokens) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
