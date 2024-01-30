import axios from "axios";
import { IUserFile } from "../models/UserFile";

const API_URI = process.env.REACT_APP_API_URI;

export async function getUserFiles(): Promise<IUserFile[]> {
  const { data } = await axios.get<IUserFile[]>(`${API_URI}/file`);
  return data;
}

export async function uploadFiles(files: FileList): Promise<IUserFile[]> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });
  const { data } = await axios.post(`${API_URI}/file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
