import axios from "@/shared/api/axios";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export interface DiscussionMessage {
  globalId: string;
  approvalRequestStepGlobalId: string;
  body: string;
  createdAt: string;
  isOutgoing: boolean;
  isDelegated: boolean;
  sentByDisplayName: string;
  sentByType: AssigneeType;
  sentOnBehalfOfDisplayName?: string;
  userFiles?: UserFile[];
}

const config = { useWorkEmployeeContext: true };

export const listRequestDiscussion = async (tenantId: string, requestId: string) => {
  const { data } = await axios.get<DiscussionMessage[]>(
    `api/v1/tenants/${tenantId}/discussions/requests/${requestId}`,
    config,
  );
  return data;
};

export const listTaskDiscussion = async (tenantId: string, taskId: string) => {
  const { data } = await axios.get<DiscussionMessage[]>(
    `api/v1/tenants/${tenantId}/discussions/tasks/${taskId}`,
    config,
  );
  return data;
};

export const sendRequestDiscussion = async (
  tenantId: string,
  requestId: string,
  body: string,
  userFileGlobalIds: string[] = [],
) => {
  const { data } = await axios.post<DiscussionMessage>(
    `api/v1/tenants/${tenantId}/discussions/requests/${requestId}`,
    { body, userFileGlobalIds },
    config,
  );
  return data;
};

export const sendTaskDiscussion = async (
  tenantId: string,
  taskId: string,
  body: string,
  userFileGlobalIds: string[] = [],
) => {
  const { data } = await axios.post<DiscussionMessage>(
    `api/v1/tenants/${tenantId}/discussions/tasks/${taskId}`,
    { body, userFileGlobalIds },
    config,
  );
  return data;
};

export const downloadDiscussionMessageFileBase64 = async (
  tenantId: string,
  messageId: string,
  globalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/v1/tenants/${tenantId}/discussions/messages/${messageId}/files/${globalId}/downloadBase64`,
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};
