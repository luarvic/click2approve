import { toast } from "react-toastify";
import { IUserFile } from "../../models/userFile";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";

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
  id: number
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
