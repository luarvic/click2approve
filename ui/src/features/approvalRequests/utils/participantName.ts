import { Tenant, TenantType } from "@/features/tenants/models/tenant";
import { UserProfile } from "@/shared/models/userProfile";

export const getParticipantName = (
  currentTenant: Tenant | null,
  profile: UserProfile | null,
  isEmployee: boolean = currentTenant?.type === TenantType.Business,
) => ({
  firstName: isEmployee ? currentTenant?.currentEmployeeFirstName : profile?.firstName,
  lastName: isEmployee ? currentTenant?.currentEmployeeLastName : profile?.lastName,
});

export const hasIncompleteBusinessParticipantName = (currentTenant: Tenant | null, profile: UserProfile | null) => {
  if (currentTenant?.type !== TenantType.Business) {
    return false;
  }

  const { firstName, lastName } = getParticipantName(currentTenant, profile);
  return !firstName?.trim() || !lastName?.trim();
};
