import { refreshAuthSession } from "@/features/identity/api/authApi";
import { getRequestContext } from "@/shared/api/requestContext";
import { Api } from "@/shared/constants/constants";
import { readTokens } from "@/shared/session/session";
import { getLoaderName } from "@/shared/utils/helpers";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: Api.baseUri,
  timeout: Api.timeoutMs,
});

const anonymousUrls = [
  "api/v1/account/forgotPassword",
  "api/v1/account/login",
  "api/v1/account/refresh",
  "api/v1/account/register",
  "api/v1/account/resendConfirmationEmail",
  "api/v1/account/resetPassword",
  "api/v1/products/info",
];

const shouldSendAuthentication = (url: string | undefined): boolean => {
  if (!url) {
    return true;
  }

  return (
    !anonymousUrls.includes(url) && !url.startsWith("api/v1/account/confirmEmail")
  );
};

axiosInstance.defaults.baseURL = Api.baseUri;
axiosInstance.interceptors.request.use(async (config) => {
  const context = getRequestContext();
  config.url && context.onLoadingChange(getLoaderName(config), 1);
  const tokens = readTokens();
  const sendAuthentication = shouldSendAuthentication(config.url);
  if (tokens && sendAuthentication) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
axiosInstance.interceptors.response.use(
  async (response) => {
    const context = getRequestContext();
    response.config.url &&
      context.onLoadingChange(
        getLoaderName(response.config),
        -1,
      );
    return response;
  },
  async (error) => {
    const context = getRequestContext();
    const originalRequest = error.config;
    if (originalRequest?.url) {
      context.onLoadingChange(
        getLoaderName(originalRequest),
        -1,
      );
    }
    // Try refreshing access token on 401 status code.
    if (
      error.response &&
      error.response.status &&
      error.response.status === 401 &&
      originalRequest.url !== "api/v1/account/refresh" &&
      !originalRequest.url.startsWith("api/v1/account/confirmEmail")
    ) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        const tokens = readTokens();
        if (tokens) {
          const newTokens = await refreshAuthSession(tokens.refreshToken);
          if (newTokens) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return axiosInstance(originalRequest);
          }
          context.onUnauthorized();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
