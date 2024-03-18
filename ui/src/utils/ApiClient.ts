import axios from "axios";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { IApprovalRequestTask } from "../models/ApprovalRequestTask";
import { ApprovalStatus } from "../models/ApprovalStatus";
import { IAuthResponse } from "../models/AuthResponse";
import { IUserFile } from "../models/UserFile";
import { API_URI } from "../stores/Constants";

axios.defaults.baseURL = API_URI;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      window.location.href = "/signin";
    }
    // TODO
    // Come up with better solution.
    console.log(error);
    return Promise.reject(error);
  }
);

export const signUpUser = async (
  email: string,
  password: string
): Promise<string> => {
  const { data } = await axios.post<string>("api/account/register", {
    email: email,
    password: password,
  });
  return data;
};
export const signInUser = async (
  email: string,
  password: string
): Promise<string> => {
  const { data } = await axios.post<IAuthResponse>("api/account/login", {
    email: email,
    password: password,
  });
  return data.accessToken;
};

export const validateToken = async (): Promise<void> => {
  await axios.get("api/account/manage/info");
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
