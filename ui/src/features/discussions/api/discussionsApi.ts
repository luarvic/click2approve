import axios from "@/shared/api/axios";
import { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const listRequestDiscussion = async (
  tenantId: string,
  requestId: string,
): Promise<DiscussionMessage[] | null> => {
  try {
    const { data } = await axios.get<DiscussionMessage[]>(
      `api/v1/tenants/${tenantId}/discussions/requests/${requestId}`,
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const listTaskDiscussion = async (tenantId: string, taskId: string): Promise<DiscussionMessage[] | null> => {
  try {
    const { data } = await axios.get<DiscussionMessage[]>(
      `api/v1/tenants/${tenantId}/discussions/tasks/${taskId}`,
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const sendRequestDiscussion = async (
  tenantId: string,
  requestId: string,
  body: string,
  userFileGlobalIds: string[] = [],
): Promise<DiscussionMessage | null> => {
  try {
    const { data } = await axios.post<DiscussionMessage>(
      `api/v1/tenants/${tenantId}/discussions/requests/${requestId}`,
      { body, userFileGlobalIds },
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const sendTaskDiscussion = async (
  tenantId: string,
  taskId: string,
  body: string,
  userFileGlobalIds: string[] = [],
): Promise<DiscussionMessage | null> => {
  try {
    const { data } = await axios.post<DiscussionMessage>(
      `api/v1/tenants/${tenantId}/discussions/tasks/${taskId}`,
      { body, userFileGlobalIds },
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
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
