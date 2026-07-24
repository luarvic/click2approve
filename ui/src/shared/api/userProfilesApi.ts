import axios from "@/shared/api/axios";
import { Api } from "@/shared/constants/constants";
import { UserProfile, UserProfileUpdateRequest } from "@/shared/models/userProfile";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const getPublicApiUrl = (path?: string): string | undefined => {
  if (!path) {
    return undefined;
  }

  const baseUri = Api.baseUri.endsWith("/") ? Api.baseUri : `${Api.baseUri}/`;
  return `${baseUri}${path}`;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data } = await axios.get<UserProfile>("api/v1/userProfiles");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateUserProfile = async (
  payload: UserProfileUpdateRequest
): Promise<UserProfile | null> => {
  try {
    const { data } = await axios.put<UserProfile>("api/v1/userProfiles", payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const uploadUserAvatar = async (
  avatar: File
): Promise<UserProfile | null> => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatar);
    const { data } = await axios.post<UserProfile>(
      "api/v1/userProfiles/avatar",
      formData
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteUserAvatar = async (): Promise<UserProfile | null> => {
  try {
    const { data } = await axios.delete<UserProfile>("api/v1/userProfiles/avatar");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
