import { stores } from "@/app/stores";
import { refreshAuthSession } from "@/features/identity/api/authApi";
import { Api } from "@/shared/constants/constants";
import { readTokens } from "@/shared/session/session";
import { getLoaderName } from "@/shared/utils/helpers";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: Api.baseUri,
  timeout: Api.timeoutMs,
});

const anonymousUrls = [
  "api/account/forgotPassword",
  "api/account/login",
  "api/account/refresh",
  "api/account/register",
  "api/account/resendConfirmationEmail",
  "api/account/resetPassword",
  "api/product/info",
];

const shouldSendAuthentication = (url: string | undefined): boolean => {
  if (!url) {
    return true;
  }

  return (
    !anonymousUrls.includes(url) && !url.startsWith("api/account/confirmEmail")
  );
};

axiosInstance.defaults.baseURL = Api.baseUri;
axiosInstance.interceptors.request.use(async (config) => {
  config.url &&
    stores.commonStore.updateLoadingCounter(getLoaderName(config), 1);
  const tokens = readTokens();
  const sendAuthentication = shouldSendAuthentication(config.url);
  if (tokens && sendAuthentication) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  if (
    sendAuthentication &&
    stores.productStore.tenantsAreEnabled &&
    stores.tenantStore.currentTenantId
  ) {
    config.headers["X-Tenant-Id"] = stores.tenantStore.currentTenantId;
  }
  return config;
});
axiosInstance.interceptors.response.use(
  async (response) => {
    response.config.url &&
      stores.commonStore.updateLoadingCounter(
        getLoaderName(response.config),
        -1,
      );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest?.url) {
      stores.commonStore.updateLoadingCounter(
        getLoaderName(originalRequest),
        -1,
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
          const newTokens = await refreshAuthSession(tokens.refreshToken);
          if (newTokens) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return axiosInstance(originalRequest);
          }
          stores.userAccountStore.signOut();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
