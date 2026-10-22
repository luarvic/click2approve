import type { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { normalizeUserFileDates } from "@/features/userFiles/utils/userFileDateNormalizers";

export const normalizeDiscussionMessageDates = (message: DiscussionMessage): DiscussionMessage => ({
  ...message,
  userFiles: message.userFiles?.map(normalizeUserFileDates),
});
