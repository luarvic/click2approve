import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const uploadUserFiles = async (
  files: FileList | File[]
): Promise<UserFile[]> => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const { data } = await axios.post<UserFile[]>(
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

export const downloadUserFileBase64 = async (
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
