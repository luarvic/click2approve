import axios from "axios";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { IApprovalRequestTask } from "../models/ApprovalRequestTask";
import { ApprovalStatus } from "../models/ApprovalStatus";
import { IAuthResponse } from "../models/AuthResponse";
import { ICredentials } from "../models/Credentials";
import { IUserAccount } from "../models/UserAccount";
import { IUserFile } from "../models/UserFile";
import { API_URI } from "../stores/Constants";
import { readTokens, writeTokens } from "./CacheClient";

axios.defaults.baseURL = API_URI;
axios.interceptors.request.use((config) => {
  var tokens = readTokens();
  if (tokens) {
    console.log(tokens);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      if (!originalRequest._retry) {
        const tokens = readTokens();
        if (tokens) {
          const newTokens = await refreshAccessToken(tokens.refreshToken);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newTokens.accessToken}`;
          return axios(originalRequest);
        }
      } else {
        window.location.href = "/signin";
      }
    }
    // TODO
    // Come up with better solution.
    console.log(error);
    return Promise.reject(error);
  }
);

export const signUpUser = async (
  credentials: ICredentials
): Promise<string> => {
  const { data } = await axios.post<string>("api/account/register", {
    email: credentials.email,
    password: credentials.password,
  });
  return data;
};

export const signInUser = async (
  credentials: ICredentials
): Promise<IAuthResponse> => {
  const { data } = await axios.post<IAuthResponse>("api/account/login", {
    email: credentials.email,
    password: credentials.password,
  });
  writeTokens(data);
  return data;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<IAuthResponse> => {
  const { data } = await axios.post<IAuthResponse>("api/account/refresh", {
    refreshToken: refreshToken,
  });
  writeTokens(data);
  return data;
};

export const getUserInfo = async (): Promise<IUserAccount> => {
  const { data } = await axios.get<IUserAccount>("api/account/manage/info");
  return data;
};

export const uploadFiles = async (files: FileList): Promise<IUserFile[]> => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  const { data } = await axios.post<IUserFile[]>("api/file/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const listFiles = async (): Promise<IUserFile[]> => {
  const { data } = await axios.get<IUserFile[]>("api/file/list");
  return data;
};

export const downloadFile = async (id: string): Promise<ArrayBuffer> => {
  const { data } = await axios.get(`api/file/download?id=${id}`);
  return data;
};

export const downloadFileBase64 = async (id: string): Promise<string> => {
  const { data } = await axios.get(`api/file/downloadBase64?id=${id}`);
  return data;
};

export const submitApprovalRequest = async (
  files: IUserFile[],
  approvers: string[],
  approveBy: Date | null,
  comment: string | null
): Promise<string> => {
  const { data } = await axios.post("api/request", {
    userFileIds: files.map((userFile) => userFile.id.toString()),
    emails: approvers,
    approveBy: approveBy,
    comment: comment,
  });
  return data;
};

export const deleteApprovalRequest = async (id: number): Promise<string> => {
  const { data } = await axios.delete(`api/request?id=${id}`);
  return data;
};

export const listApprovalRequests = async (): Promise<IApprovalRequest[]> => {
  const { data } = await axios.get<IApprovalRequest[]>("api/request/list");
  return data;
};

export const completeTask = async (
  id: number,
  status: ApprovalStatus,
  comment: string | null
): Promise<string> => {
  const { data } = await axios.post("api/task/complete", {
    id: id,
    status: status,
    comment: comment,
  });
  return data;
};

export const listUncompletedTasks = async (): Promise<
  IApprovalRequestTask[]
> => {
  const { data } = await axios.get<IApprovalRequestTask[]>(
    "api/task/listUncompleted"
  );
  return data;
};

export const listCompletedTasks = async (): Promise<IApprovalRequestTask[]> => {
  const { data } = await axios.get<IApprovalRequestTask[]>(
    "api/task/listCompleted"
  );
  return data;
};

export const countUncompletedTasks = async (): Promise<number> => {
  const { data } = await axios.get<number>("api/task/countUncompleted");
  return data;
};
