import {
  deleteUserAvatar,
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from "@/shared/api/userProfileApi";
import { UserProfile, UserProfileUpdateRequest } from "@/shared/models/userProfile";
import { makeAutoObservable, runInAction } from "mobx";

export class UserProfileStore {
  profile: UserProfile | null = null;
  hasLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  get displayName(): string | null {
    const fullName = [this.profile?.firstName, this.profile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || null;
  }

  load = async (): Promise<void> => {
    const profile = await getUserProfile();
    runInAction(() => {
      this.profile = profile;
      this.hasLoaded = true;
    });
  };

  update = async (
    payload: UserProfileUpdateRequest
  ): Promise<UserProfile | null> => {
    const profile = await updateUserProfile(payload);
    if (profile) {
      runInAction(() => {
        this.profile = profile;
        this.hasLoaded = true;
      });
    }
    return profile;
  };

  uploadAvatar = async (avatar: File): Promise<boolean> => {
    const profile = await uploadUserAvatar(avatar);
    if (!profile) {
      return false;
    }

    runInAction(() => {
      this.profile = profile;
      this.hasLoaded = true;
    });
    return true;
  };

  deleteAvatar = async (): Promise<boolean> => {
    const profile = await deleteUserAvatar();
    if (!profile) {
      return false;
    }

    runInAction(() => {
      this.profile = profile;
      this.hasLoaded = true;
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.profile = null;
      this.hasLoaded = false;
    });
  };
}
