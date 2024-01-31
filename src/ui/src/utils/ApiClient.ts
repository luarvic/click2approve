import axios from "axios";
import { IUserFile } from "../models/UserFile";

axios.defaults.baseURL = process.env.REACT_APP_API_URI;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  return config;
});

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
