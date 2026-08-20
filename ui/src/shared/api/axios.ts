import { refreshAuthSession } from "@/features/identity/api/authApi";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getRequestContext } from "@/shared/api/requestContext";
import { Api } from "@/shared/constants/constants";
import { readTokens } from "@/shared/session/session";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: Api.baseUri,
  timeout: Api.timeoutMs,
});

const apiDelayMs = Number(import.meta.env.VITE_API_DELAY_MS ?? 0);
const workEmployeeHeaderName = "X-Click2Approve-Work-Employee";
const workEmployeeInvalidHeaderName = "X-Click2Approve-Work-Employee-Invalid";

const anonymousUrls: string[] = [
  ApiPaths.account.forgotPassword,
  ApiPaths.account.login,
  ApiPaths.account.refresh,
  ApiPaths.account.register,
  ApiPaths.account.resendConfirmationEmail,
  ApiPaths.account.resetPassword,
  ApiPaths.products.info,
];

const shouldSendAuthentication = (url: string | undefined): boolean => {
  if (!url) {
    return true;
  }

  return (
    !anonymousUrls.includes(url) &&
    !url.startsWith(ApiPaths.account.confirmEmail) &&
    !url.startsWith(ApiPaths.receiptLinks.root)
  );
};

const delayRequest = async (): Promise<void> => {
  if (!import.meta.env.DEV || apiDelayMs <= 0) {
    return;
  }

  await new Promise((resolve) => window.setTimeout(resolve, apiDelayMs));
};

axiosInstance.defaults.baseURL = Api.baseUri;
axiosInstance.interceptors.request.use(async (config) => {
  await delayRequest();
  const tokens = readTokens();
  const sendAuthentication = shouldSendAuthentication(config.url);
  if (tokens && sendAuthentication) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    const workEmployeeGlobalId = getRequestContext().getWorkEmployeeGlobalId();
    delete config.headers[workEmployeeHeaderName];
    if (workEmployeeGlobalId && config.useWorkEmployeeContext) {
      config.headers[workEmployeeHeaderName] = workEmployeeGlobalId;
    }
  }
  return config;
});
axiosInstance.interceptors.response.use(
  async (response) => response,
  async (error) => {
    const context = getRequestContext();
    const originalRequest = error.config;
    const workEmployeeIsInvalid =
      error.response?.headers?.get?.(workEmployeeInvalidHeaderName) === "true" ||
      error.response?.headers?.[workEmployeeInvalidHeaderName.toLowerCase()] === "true";
    if (
      error.response?.status === 409 &&
      workEmployeeIsInvalid &&
      originalRequest &&
      !originalRequest.workEmployeeRetry
    ) {
      originalRequest.workEmployeeRetry = true;
      await context.onWorkEmployeeInvalid();
      return axiosInstance(originalRequest);
    }
    // Try refreshing access token on 401 status code.
    if (
      error.response &&
      error.response.status &&
      error.response.status === 401 &&
      originalRequest?.url !== ApiPaths.account.refresh &&
      !originalRequest?.url.startsWith(ApiPaths.account.confirmEmail) &&
      !originalRequest?.url.startsWith(ApiPaths.receiptLinks.root)
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
