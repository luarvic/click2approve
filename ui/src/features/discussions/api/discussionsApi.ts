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
