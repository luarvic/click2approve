import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listApprovalStepTemplates = async (
  tenantId: number
): Promise<ApprovalStepTemplate[]> => {
  try {
    const { data } = await axios.get<ApprovalStepTemplate[]>(
      `api/tenants/${tenantId}/approvalStepTemplates`
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createApprovalStepTemplate = async (
  tenantId: number,
  payload: UpsertApprovalStepTemplateRequest
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.post<ApprovalStepTemplate>(
      `api/tenants/${tenantId}/approvalStepTemplates`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateApprovalStepTemplate = async (
  tenantId: number,
  templateId: number,
  payload: UpsertApprovalStepTemplateRequest
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.put<ApprovalStepTemplate>(
      `api/tenants/${tenantId}/approvalStepTemplates/${templateId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteApprovalStepTemplate = async (
  tenantId: number,
  templateId: number
): Promise<boolean> => {
  try {
    await axios.delete(
      `api/tenants/${tenantId}/approvalStepTemplates/${templateId}`
    );
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
