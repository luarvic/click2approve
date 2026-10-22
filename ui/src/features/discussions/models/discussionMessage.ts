import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";

export interface DiscussionMessage {
  approvalRequestStepGlobalId: string;
  body: string;
  createdAt: string;
  globalId: string;
  isDelegated: boolean;
  isOutgoing: boolean;
  sentByDisplayName: string;
  sentByType: AssigneeType;
  sentOnBehalfOfDisplayName?: string;
  userFiles?: UserFile[];
}
