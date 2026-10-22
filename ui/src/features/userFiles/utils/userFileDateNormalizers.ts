import type { UserFile } from "@/features/userFiles/models/userFile";
import { parseUtcDateTime } from "@/shared/utils/dateTime";

export const normalizeUserFileDates = (userFile: UserFile): UserFile => ({
  ...userFile,
  createdAtDate: parseUtcDateTime(userFile.createdAt),
});
