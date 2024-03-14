import axios from "axios";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { ApprovalRequestStatus } from "../models/ApprovalRequestStatus";
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

export const validateToken = async (): Promise<void> => {
  await axios.get("api/account/manage/info");
};

export const listUserFiles = async (): Promise<IUserFile[]> => {
  const { data } = await axios.get<IUserFile[]>("api/file/list");
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

export const downloadFile = async (id: string): Promise<ArrayBuffer> => {
  const { data } = await axios.get(`api/file/download?id=${id}`);
  return data;
};

export const downloadFileBase64 = async (id: string): Promise<string> => {
  const { data } = await axios.get(`api/file/downloadBase64?id=${id}`);
  return data;
};

export const downloadArchiveBase64 = async (
  files: IUserFile[]
): Promise<string> => {
  const { data } = await axios.post(
    "api/file/downloadArchiveBase64",
    files.map((userFile) => userFile.id.toString())
  );
  return data;
};

export const submitApprovalRequest = async (
  files: IUserFile[],
  approvers: string[],
  approveBy: Date,
  comment: string | null
): Promise<string> => {
  const { data } = await axios.post("api/request/submit", {
    userFileIds: files.map((userFile) => userFile.id.toString()),
    emails: approvers,
    approveBy: approveBy,
    comment: comment,
  });
  return data;
};

export const handleApprovalRequest = async (
  id: number,
  status: ApprovalRequestStatus,
  comment: string | null
): Promise<string> => {
  const { data } = await axios.post("api/request/handle", {
    id: id,
    status: status,
    comment: comment,
  });
  return data;
};

export const listIncomingApprovalRequests = async (
  statuses: ApprovalRequestStatus[]
): Promise<IApprovalRequest[]> => {
  const { data } = await axios.post<IApprovalRequest[]>(
    "api/request/listIncoming",
    statuses
  );
  return data;
};

export const listOutgoingApprovalRequests = async (): Promise<
  IApprovalRequest[]
> => {
  const { data } = await axios.get<IApprovalRequest[]>(
    "api/request/listOutgoing"
  );
  console.table(data);
  return data;
};

export const getNumberOfIncomingApprovalRequests = async (
  statuses: ApprovalRequestStatus[]
): Promise<number> => {
  const { data } = await axios.post<number>(
    "api/request/countIncoming",
    statuses
  );
  return data;
};
