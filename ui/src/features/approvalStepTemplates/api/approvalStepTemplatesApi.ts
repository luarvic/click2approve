import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listApprovalStepTemplates = async (
  tenantGlobalId: string
): Promise<ApprovalStepTemplate[]> => {
  try {
    const { data } = await axios.get<ApprovalStepTemplate[]>(
      `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates`
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createApprovalStepTemplate = async (
  tenantGlobalId: string,
  payload: UpsertApprovalStepTemplateRequest
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.post<ApprovalStepTemplate>(
      `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateApprovalStepTemplate = async (
  tenantGlobalId: string,
  templateGlobalId: string,
  payload: UpsertApprovalStepTemplateRequest
): Promise<ApprovalStepTemplate | null> => {
  try {
    const { data } = await axios.put<ApprovalStepTemplate>(
      `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates/${templateGlobalId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteApprovalStepTemplate = async (
  tenantGlobalId: string,
  templateGlobalId: string
): Promise<boolean> => {
  try {
    await axios.delete(
      `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates/${templateGlobalId}`
    );
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
