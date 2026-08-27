import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const listApprovalStepTemplates = async (tenantGlobalId: string): Promise<ApprovalStepTemplate[]> => {
  try {
    const { data } = await axios.get<ApprovalStepTemplate[]>(ApiPaths.tenants.approvalStepTemplates(tenantGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const getApprovalStepTemplate = async (
  tenantGlobalId: string,
  templateGlobalId: string,
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.get<ApprovalStepTemplate>(
      ApiPaths.tenants.approvalStepTemplate(tenantGlobalId, templateGlobalId),
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createApprovalStepTemplate = async (
  tenantGlobalId: string,
  payload: UpsertApprovalStepTemplateRequest,
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.post<ApprovalStepTemplate>(
      ApiPaths.tenants.approvalStepTemplates(tenantGlobalId),
      payload,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateApprovalStepTemplate = async (
  tenantGlobalId: string,
  templateGlobalId: string,
  payload: UpsertApprovalStepTemplateRequest,
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.put<ApprovalStepTemplate>(
      ApiPaths.tenants.approvalStepTemplate(tenantGlobalId, templateGlobalId),
      payload,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteApprovalStepTemplate = async (
  tenantGlobalId: string,
  templateGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.approvalStepTemplate(tenantGlobalId, templateGlobalId));
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
