import axios, { AxiosError } from "axios";
import { IUserFile } from "../models/UserFile";
import { API_URI } from "../stores/Constants";

axios.defaults.baseURL = API_URI;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // TODO
    // Come up with better solution.
    console.log(error);
    return Promise.reject(error);
  }
);

export const signInUser = async (
  username: string,
  password: string
): Promise<string> => {
  const { data } = await axios.post<string>("account/authenticate", {
    username: username,
    password: password,
  });
  return data;
};

export const signUpUser = async (
  username: string,
  password: string
): Promise<string> => {
  const { data } = await axios.post<string>("account/register", {
    username: username,
    password: password,
  });
  return data;
};

export const validateToken = async (): Promise<void> => {
  await axios.head("account");
};

export const getUserFiles = async (): Promise<IUserFile[]> => {
  const { data } = await axios.get<IUserFile[]>("file");
  return data;
};

export const uploadFiles = async (files: FileList): Promise<IUserFile[]> => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  const { data } = await axios.post<IUserFile[]>("file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const downloadFile = async (
  id: string,
  preview: boolean
): Promise<ArrayBuffer> => {
  const { data } = await axios.get(`download?id=${id}&preview=${preview}`);
  return data;
};

export const downloadFileBase64 = async (
  id: string,
  preview: boolean = false
): Promise<string> => {
  const { data } = await axios.get(
    `downloadBase64?id=${id}&preview=${preview}`
  );
  return data;
};

export const downloadArchiveBase64 = async (
  files: IUserFile[]
): Promise<string> => {
  const { data } = await axios.post(
    "downloadArchiveBase64",
    files.map((userFile) => userFile.id.toString())
  );
  return data;
};

export const shareUserFiles = async (
  files: IUserFile[],
  availableUntil: Date
): Promise<string> => {
  const { data } = await axios.post("share", {
    ids: files.map((userFile) => userFile.id.toString()),
    availableUntil: availableUntil,
  });
  return data;
};

export const testSharedArchive = async (key: string): Promise<boolean> => {
  const response = await axios.get(`testShared?key=${key}`);
  return response.status === 200 ? true : false;
};

export const downloadSharedArchive = async (key: string): Promise<string> => {
  const { data } = await axios.get(`downloadShared?key=${key}`);
  return data;
};
