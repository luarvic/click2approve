import {
  ApprovalStepTemplate,
  UpsertApprovalStepTemplateRequest,
} from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import type { GridPage } from "@/shared/grids/gridPage";

export const listApprovalStepTemplateGrid = async (
  tenantGlobalId: string,
  query: SimpleGridQuery,
): Promise<GridPage<ApprovalStepTemplate>> => {
  try {
    const { data } = await axios.get<GridPage<ApprovalStepTemplate>>(
      `${ApiPaths.tenants.approvalStepTemplates(tenantGlobalId)}?${new URLSearchParams({
        ...Object.fromEntries(Object.entries(query.filters).filter(([, value]) => value)),
        page: String(query.page),
        pageSize: String(query.pageSize),
        sortBy: query.sortBy,
        sortDirection: query.sortDirection,
      })}`,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return { items: [], totalCount: 0 };
  }
};

export const listApprovalStepTemplates = async (tenantGlobalId: string): Promise<ApprovalStepTemplate[]> => {
  return (
    await listApprovalStepTemplateGrid(tenantGlobalId, {
      filters: {},
      page: 0,
      pageSize: 100,
      sortBy: "name",
      sortDirection: "asc",
    })
  ).items;
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
