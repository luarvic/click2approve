import axios from "axios";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/approvalRequest";
import { IApprovalRequestTask } from "../models/approvalRequestTask";
import { ApprovalStatus } from "../models/approvalStatus";
import { IAuthResponse } from "../models/authResponse";
import { ICredentials } from "../models/credentials";
import { IUserAccount } from "../models/userAccount";
import { IUserFile } from "../models/userFile";
import { stores } from "../stores/stores";
import { API_URI } from "../stores/constantsStore";
import { deleteTokens, readTokens, writeTokens } from "./cacheClient";
import { getLoaderName, getUserFriendlyApiErrorMessage } from "./converters";

axios.defaults.baseURL = API_URI;
axios.interceptors.request.use(async (config) => {
  config.url &&
    stores.commonStore.updateLoadingCounter(getLoaderName(config), 1);
  var tokens = readTokens();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});
axios.interceptors.response.use(
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

export const register = async (credentials: ICredentials): Promise<boolean> => {
  try {
    await axios.post("api/account/register", {
      email: credentials.email,
      password: credentials.password,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const confirmEmail = async (
  userId: string,
  code: string
): Promise<boolean> => {
  try {
    await axios.get(`api/account/confirmEmail?userId=${userId}&code=${code}`);
    return true;
  } catch {
    toast.error("Email confirmation failed.");
    return false;
  }
};

export const login = async (credentials: ICredentials): Promise<boolean> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/login", {
      email: credentials.email,
      password: credentials.password,
    });
    writeTokens(data);
    return true;
  } catch (e) {
    deleteTokens();
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountResendConfirmationEmail = async (
  email: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/resendConfirmationEmail", {
      email: email,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountForgotPassword = async (
  email: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/forgotPassword", {
      email: email,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountResetPassword = async (
  email: string,
  code: string,
  password: string
): Promise<boolean> => {
  try {
    await axios.post("api/account/resetPassword", {
      email: email,
      resetCode: code,
      newPassword: password,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const accountRefresh = async (
  refreshToken: string
): Promise<IAuthResponse | null> => {
  try {
    const { data } = await axios.post<IAuthResponse>("api/account/refresh", {
      refreshToken: refreshToken,
    });
    writeTokens(data);
    return data;
  } catch (e) {
    return null;
  }
};

export const accountManageInfo = async (): Promise<IUserAccount | null> => {
  try {
    const { data } = await axios.get<IUserAccount>("api/account/manage/info");
    return data;
  } catch (e) {
    return null;
  }
};

export const fileUpload = async (files: FileList): Promise<IUserFile[]> => {
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

export const fileList = async (): Promise<IUserFile[]> => {
  try {
    const { data } = await axios.get<IUserFile[]>("api/file/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const fileDownloadBase64 = async (
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

export const fileDelete = async (id: number): Promise<void> => {
  try {
    await axios.delete(`api/file?id=${id}`);
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const approvalRequestSubmit = async (
  files: IUserFile[],
  approvers: string[],
  approveBy: Date | null,
  comment: string | undefined
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

export const approvalRequestDelete = async (id: number): Promise<void> => {
  try {
    await axios.delete(`api/request?id=${id}`);
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const approvalRequestList = async (): Promise<IApprovalRequest[]> => {
  try {
    const { data } = await axios.get<IApprovalRequest[]>("api/request/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const taskComplete = async (
  id: number,
  status: ApprovalStatus,
  comment: string | undefined
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

export const taskListUncompleted = async (): Promise<
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

export const taskListCompleted = async (): Promise<IApprovalRequestTask[]> => {
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

export const taskCountUncompleted = async (): Promise<number> => {
  try {
    const { data } = await axios.get<number>("api/task/countUncompleted");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return 0;
  }
};
