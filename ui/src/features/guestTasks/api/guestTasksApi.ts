import type { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import {
  normalizeApprovalRequestDates,
  normalizeApprovalRequestTaskDates,
} from "@/features/approvalRequests/utils/approvalRequestDateNormalizers";
import { Api } from "@/shared/config/application";
import axios, { type Method } from "axios";

/** A dedicated client keeps invitation credentials separate from account tokens and refresh handling. */
export const createGuestTaskApi = (taskGlobalId: string, token: string) => {
  const client = axios.create({
    baseURL: Api.baseUri,
    timeout: Api.timeoutMs,
    headers: { "X-Click2Approve-Guest": token },
    withCredentials: false,
  });
  const root = `api/v1/guest/tasks/${taskGlobalId}`;
  return {
    getTask: async (): Promise<ApprovalRequestTask> => {
      const { data } = await client.get<ApprovalRequestTask>(root);
      normalizeApprovalRequestTaskDates(data);
      if (data.approvalRequest) normalizeApprovalRequestDates(data.approvalRequest);
      return data;
    },
    request: async <T>(method: Method, path = "", data?: unknown): Promise<T> =>
      (await client.request<T>({ method, url: `${root}${path}`, data })).data,
  };
};

export type GuestTaskApi = ReturnType<typeof createGuestTaskApi>;
export const isGuestTaskUnavailable = (error: unknown): boolean =>
  axios.isAxiosError(error) && [401, 403, 404, 410].includes(error.response?.status ?? 0);
