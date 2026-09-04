import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";

export interface SubscriptionUsage {
  plan: SubscriptionPlan;
  limits: {
    requestsPerMonth: number;
    tasksPerMonth: number;
    storageGigabytes: number;
    aiTokensPerMonth: number;
  };
  requestsThisMonth: number;
  tasksThisMonth: number;
  storageBytes: number;
  usagePeriodEndsAt: string;
  usagePeriodStartsAt: string;
}

export const getSubscriptionUsage = async (tenantGlobalId: string): Promise<SubscriptionUsage> => {
  const { data } = await axios.get<SubscriptionUsage>(ApiPaths.tenants.subscriptionUsage(tenantGlobalId));
  return data;
};
