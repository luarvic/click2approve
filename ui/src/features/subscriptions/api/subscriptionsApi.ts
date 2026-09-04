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

export interface SubscriptionPlanConfiguration {
  plan: SubscriptionPlan;
  requestsPerMonth: number;
  storageGigabytes: number;
  tasksPerMonth: number;
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlanConfiguration[]> => {
  const { data } = await axios.get<SubscriptionPlanConfiguration[]>(ApiPaths.products.subscriptionPlans);
  return data;
};

export const getSubscriptionUsage = async (tenantGlobalId: string): Promise<SubscriptionUsage> => {
  const { data } = await axios.get<SubscriptionUsage>(ApiPaths.tenants.subscriptionUsage(tenantGlobalId));
  return data;
};

export const changeSubscriptionPlan = async (tenantGlobalId: string, plan: SubscriptionPlan): Promise<void> => {
  await axios.put(ApiPaths.tenants.subscriptionPlan(tenantGlobalId), { plan });
};
