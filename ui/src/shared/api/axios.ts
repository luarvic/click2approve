import { refreshAuthSession } from "@/features/identity/api/authApi";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getRequestContext } from "@/shared/api/requestContext";
import { Api } from "@/shared/config/application";
import { readTokens, writeTokens } from "@/shared/session/session";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: Api.baseUri,
  timeout: Api.timeoutMs,
  withCredentials: true,
});

const apiDelayMs = Number(import.meta.env.VITE_API_DELAY_MS ?? 0);
const workEmployeeHeaderName = "X-Click2Approve-Work-Employee";
const workEmployeeInvalidHeaderName = "X-Click2Approve-Work-Employee-Invalid";
const tenantAccessRevokedHeaderName = "X-Click2Approve-Tenant-Access-Revoked";
let refreshRequest: {
  promise: ReturnType<typeof refreshAuthSession>;
  refreshToken: string;
} | null = null;

interface TenantSuspendedResponse {
  code: string;
  tenantGlobalId: string;
}

const anonymousUrls: string[] = [
  ApiPaths.account.forgotPassword,
  ApiPaths.account.login,
  ApiPaths.account.passkeys.authentication,
  ApiPaths.account.passkeys.authenticationOptions,
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

const refreshTokens = async (refreshToken: string) => {
  if (refreshRequest?.refreshToken === refreshToken) return await refreshRequest.promise;

  const request = { promise: refreshAuthSession(refreshToken), refreshToken };
  refreshRequest = request;
  try {
    return await request.promise;
  } finally {
    if (refreshRequest === request) refreshRequest = null;
  }
};

const handleTenantSuspension = (error: { response?: { data?: unknown; status?: number } }): boolean => {
  const { response } = error;
  const data = response?.data as Partial<TenantSuspendedResponse> | undefined;
  if (response?.status !== 402 || data?.code !== "tenant_suspended" || typeof data.tenantGlobalId !== "string") {
    return false;
  }

  getRequestContext().onTenantSuspended(data.tenantGlobalId);
  return true;
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
    if (handleTenantSuspension(error)) {
      return Promise.reject(error);
    }
    const originalRequest = error.config;
    const tenantAccessWasRevoked =
      error.response?.headers?.get?.(tenantAccessRevokedHeaderName) === "true" ||
      error.response?.headers?.[tenantAccessRevokedHeaderName.toLowerCase()] === "true";
    if (error.response?.status === 409 && tenantAccessWasRevoked) {
      await context.onTenantAccessRevoked();
      return Promise.reject(error);
    }
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
      originalRequest &&
      shouldSendAuthentication(originalRequest.url)
    ) {
      if (originalRequest._retry) {
        const authorization = originalRequest.headers?.Authorization ?? originalRequest.headers?.get?.("Authorization");
        if (authorization === `Bearer ${readTokens()?.accessToken}`) context.onUnauthorized();
      } else {
        originalRequest._retry = true;
        const tokens = readTokens();
        if (tokens) {
          const newTokens = await refreshTokens(tokens.refreshToken);
          if (newTokens && readTokens()?.refreshToken === tokens.refreshToken) {
            writeTokens(newTokens);
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
        if (!tokens || readTokens()?.refreshToken === tokens.refreshToken) context.onUnauthorized();
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
