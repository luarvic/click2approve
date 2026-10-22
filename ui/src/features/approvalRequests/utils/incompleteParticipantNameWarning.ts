import { TenantType } from "@/features/tenants/models/tenant";

export const getIncompleteParticipantNameWarning = (tenantType?: TenantType) => {
  if (tenantType !== TenantType.Business) {
    return undefined;
  }

  return {
    message: "Your employee name is incomplete and will appear as such on the record.",
    title: "Employee name is incomplete",
  };
};
