import axios from "axios";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { IApprovalRequestTask } from "../models/ApprovalRequestTask";
import { ApprovalStatus } from "../models/ApprovalStatus";
import { IAuthResponse } from "../models/AuthResponse";
import { ICredentials } from "../models/Credentials";
import { IUserAccount } from "../models/UserAccount";
import { IUserFile } from "../models/UserFile";
import { API_URI } from "../stores/Constants";
import { deleteTokens, readTokens, writeTokens } from "./CacheClient";
import { getUserFriendlyApiErrorMessage } from "./Converters";

axios.defaults.baseURL = API_URI;
axios.interceptors.request.use((config) => {
  var tokens = readTokens();
  if (tokens) {
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
          if (newTokens) {
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newTokens.accessToken}`;
            return axios(originalRequest);
          }
        }
      }
      if (!window.location.pathname.toLocaleLowerCase().startsWith("/signin")) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export const signUpUser = async (
  credentials: ICredentials
): Promise<void | null> => {
  try {
    await axios.post<string>("api/account/register", {
      email: credentials.email,
      password: credentials.password,
    });
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const signInUser = async (credentials: ICredentials): Promise<void> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/login", {
      email: credentials.email,
      password: credentials.password,
    });
    writeTokens(data);
  } catch (e) {
    deleteTokens();
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<IAuthResponse | null> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/refresh", {
      refreshToken: refreshToken,
    });
    writeTokens(data);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const getUserInfo = async (): Promise<IUserAccount | null> => {
  try {
    const { data } = await axios.get<IUserAccount>("api/account/manage/info");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const uploadFiles = async (files: FileList): Promise<IUserFile[]> => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const { data } = await axios.post<IUserFile[]>(
      "api/file/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const listFiles = async (): Promise<IUserFile[]> => {
  try {
    const { data } = await axios.get<IUserFile[]>("api/file/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const downloadFileBase64 = async (
  id: string
): Promise<string | null> => {
  try {
    const { data } = await axios.get(`api/file/downloadBase64?id=${id}`);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const submitApprovalRequest = async (
  files: IUserFile[],
  approvers: string[],
  approveBy: Date | null,
  comment: string | null
): Promise<void> => {
  try {
    await axios.post("api/request", {
      userFileIds: files.map((userFile) => userFile.id.toString()),
      emails: approvers,
      approveBy: approveBy,
      comment: comment,
    });
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const deleteApprovalRequest = async (id: number): Promise<void> => {
  try {
    await axios.delete(`api/request?id=${id}`);
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const listApprovalRequests = async (): Promise<IApprovalRequest[]> => {
  try {
    const { data } = await axios.get<IApprovalRequest[]>("api/request/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const completeTask = async (
  id: number,
  status: ApprovalStatus,
  comment: string | null
): Promise<void> => {
  try {
    await axios.post("api/task/complete", {
      id: id,
      status: status,
      comment: comment,
    });
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const listUncompletedTasks = async (): Promise<
  IApprovalRequestTask[]
> => {
  try {
    const { data } = await axios.get<IApprovalRequestTask[]>(
      "api/task/listUncompleted"
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const listCompletedTasks = async (): Promise<IApprovalRequestTask[]> => {
  try {
    const { data } = await axios.get<IApprovalRequestTask[]>(
      "api/task/listCompleted"
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const countUncompletedTasks = async (): Promise<number> => {
  try {
    const { data } = await axios.get<number>("api/task/countUncompleted");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return 0;
  }
};
