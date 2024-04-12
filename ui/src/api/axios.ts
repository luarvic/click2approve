import axios from "axios";
import { stores } from "../stores/stores";
import { API_TIMEOUT_MS, API_URI } from "../utils/constants";
import { getLoaderName } from "../utils/helpers";
import { readTokens } from "../modules/session";
import { accountRefresh } from "./controllers/auth";

const axiosInstance = axios.create({
  baseURL: API_URI,
  timeout: API_TIMEOUT_MS,
});

axiosInstance.defaults.baseURL = API_URI;
axiosInstance.interceptors.request.use(async (config) => {
  config.url &&
    stores.commonStore.updateLoadingCounter(getLoaderName(config), 1);
  var tokens = readTokens();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
axiosInstance.interceptors.response.use(
  async (response) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    response.config.url &&
      stores.commonStore.updateLoadingCounter(
        getLoaderName(response.config),
        -1
      );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    originalRequest.url &&
      stores.commonStore.updateLoadingCounter(
        getLoaderName(originalRequest),
        -1
      );
    if (
      error.response.status === 401 &&
      originalRequest.url !== "api/account/refresh" &&
      !originalRequest.url.startsWith("api/account/confirmEmail")
    ) {
      if (!originalRequest._retry) {
        const tokens = readTokens();
        if (tokens) {
          const newTokens = await accountRefresh(tokens.refreshToken);
          if (newTokens) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newTokens.accessToken}`;
            return axios(originalRequest);
          }
        }
      }
      if (!window.location.pathname.toLocaleLowerCase().startsWith("/sign")) {
        window.location.href = "/signIn";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
