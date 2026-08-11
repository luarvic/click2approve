import axios from "@/shared/api/axios";

export interface DiscussionMessage {
  globalId: string;
  approvalRequestStepGlobalId: string;
  body: string;
  createdAt: string;
  isOutgoing: boolean;
  isDelegated: boolean;
  sentByDisplayName: string;
  sentOnBehalfOfDisplayName?: string;
}

export interface DiscussionUnreadItem {
  globalId: string;
  approvalRequestGlobalId: string;
  approvalRequestTaskGlobalId?: string;
  approvalRequestTitle: string;
  revisionNumber: number;
  lastMessageCreatedAt: string;
  senderDisplayName: string;
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

export const sendRequestDiscussion = async (tenantId: string, requestId: string, body: string) => {
  const { data } = await axios.post<DiscussionMessage>(
    `api/v1/tenants/${tenantId}/discussions/requests/${requestId}`,
    { body },
    config,
  );
  return data;
};

export const sendTaskDiscussion = async (tenantId: string, taskId: string, body: string) => {
  const { data } = await axios.post<DiscussionMessage>(
    `api/v1/tenants/${tenantId}/discussions/tasks/${taskId}`,
    { body },
    config,
  );
  return data;
};

export const countUnreadDiscussions = async (tenantId: string) => {
  const { data } = await axios.get<number>(
    `api/v1/tenants/${tenantId}/discussions/unread/count`,
    config,
  );
  return data;
};

export const listUnreadDiscussions = async (tenantId: string, take: number) => {
  const { data } = await axios.get<DiscussionUnreadItem[]>(
    `api/v1/tenants/${tenantId}/discussions/unread?take=${take}`,
    config,
  );
  return data;
};
