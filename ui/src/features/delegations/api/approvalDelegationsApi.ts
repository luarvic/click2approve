import { ApprovalDelegation, ApprovalDelegationUpsert } from "@/features/delegations/models/approvalDelegation";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import type { GridPage } from "@/shared/grids/gridPage";

export const listApprovalDelegationGrid = async (
  tenantGlobalId: string,
  query: SimpleGridQuery,
): Promise<GridPage<ApprovalDelegation>> => {
  try {
    const { data } = await axios.get<GridPage<ApprovalDelegation>>(
      `${ApiPaths.tenants.delegations(tenantGlobalId)}?${new URLSearchParams({
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

export const listApprovalDelegations = async (tenantGlobalId: string): Promise<ApprovalDelegation[]> => {
  return (
    await listApprovalDelegationGrid(tenantGlobalId, {
      filters: {},
      page: 0,
      pageSize: 100,
      sortBy: "employee",
      sortDirection: "asc",
    })
  ).items;
};

export const getApprovalDelegation = async (
  tenantGlobalId: string,
  delegationGlobalId: string,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.get<ApprovalDelegation>(
      ApiPaths.tenants.delegation(tenantGlobalId, delegationGlobalId),
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createApprovalDelegation = async (
  tenantGlobalId: string,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.post<ApprovalDelegation>(ApiPaths.tenants.delegations(tenantGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateApprovalDelegation = async (
  tenantGlobalId: string,
  delegationGlobalId: string,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.put<ApprovalDelegation>(
      ApiPaths.tenants.delegation(tenantGlobalId, delegationGlobalId),
      payload,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteApprovalDelegation = async (
  tenantGlobalId: string,
  delegationGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.delegation(tenantGlobalId, delegationGlobalId));
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
