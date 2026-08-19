import { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { normalizeDiscussionMessageDates } from "@/features/discussions/utils/discussionMessageNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const listRequestDiscussion = async (
  tenantId: string,
  requestId: string,
): Promise<DiscussionMessage[] | null> => {
  try {
    const { data } = await axios.get<DiscussionMessage[]>(
      ApiPaths.tenants.requestDiscussion(tenantId, requestId),
      config,
    );
    return data.map(normalizeDiscussionMessageDates);
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const listTaskDiscussion = async (tenantId: string, taskId: string): Promise<DiscussionMessage[] | null> => {
  try {
    const { data } = await axios.get<DiscussionMessage[]>(ApiPaths.tenants.taskDiscussion(tenantId, taskId), config);
    return data.map(normalizeDiscussionMessageDates);
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
      ApiPaths.tenants.requestDiscussion(tenantId, requestId),
      { body, userFileGlobalIds },
      config,
    );
    return normalizeDiscussionMessageDates(data);
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
      ApiPaths.tenants.taskDiscussion(tenantId, taskId),
      { body, userFileGlobalIds },
      config,
    );
    return normalizeDiscussionMessageDates(data);
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
    const { data } = await axios.get(ApiPaths.tenants.discussionMessageFile(tenantId, messageId, globalId), config);
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};
