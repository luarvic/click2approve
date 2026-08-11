import { TenantType } from "@/features/tenants/models/tenant";

export const getIncompleteParticipantNameWarning = (tenantType?: TenantType) => {
  const participant = tenantType === TenantType.Business ? "employee" : "user";
  const participantType = tenantType === TenantType.Business ? "Employee" : "User";

  return {
    message: `Your ${participant} name is incomplete and will appear as such on the record.`,
    title: `${participantType} name is incomplete`,
  };
};
