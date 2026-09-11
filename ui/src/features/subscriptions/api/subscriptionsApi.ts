import { stores } from "@/app/rootStore";
import { PaymentIssue } from "@/features/subscriptions/models/paymentIssue";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

// Refresh may include a Stripe payment attempt and verification.
const billingRefreshTimeoutMilliseconds = 60000;

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
  try {
    const { data } = await axios.get<SubscriptionPlanConfiguration[]>(ApiPaths.products.subscriptionPlans);
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export const getSubscriptionUsage = async (tenantGlobalId: string): Promise<SubscriptionUsage> => {
  try {
    const { data } = await axios.get<SubscriptionUsage>(ApiPaths.tenants.subscriptionUsage(tenantGlobalId));
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export interface BillingStatus {
  paymentIssue: PaymentIssue | null;
  canManage: boolean;
  hasSubscription: boolean;
  paymentRequired: boolean;
  cleanupStarted: boolean;
  suspendedAt: string | null;
  suspensionReason: number | null;
  recoveryDeadline: string | null;
  pendingPlan: SubscriptionPlan | null;
  scheduledPlan: SubscriptionPlan | null;
  scheduledPlanEffectiveAt: string | null;
  checkoutUrl: string | null;
}

export const getBillingStatus = async (tenantGlobalId: string): Promise<BillingStatus> => {
  try {
    const { data } = await axios.get<BillingStatus>(ApiPaths.tenants.subscriptionBilling(tenantGlobalId));
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export const refreshBilling = async (tenantGlobalId: string): Promise<BillingStatus> => {
  try {
    const { data } = await axios.post<BillingStatus>(
      `${ApiPaths.tenants.subscriptionBilling(tenantGlobalId)}/refresh`,
      undefined,
      { timeout: billingRefreshTimeoutMilliseconds },
    );
    if (!data.paymentRequired && !data.cleanupStarted && !data.suspendedAt) {
      stores.billingAccessStore.unblock(tenantGlobalId);
    }
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export const recoverPayment = async (tenantGlobalId: string): Promise<string> => {
  try {
    const { data } = await axios.post<{ url: string }>(
      `${ApiPaths.tenants.subscriptionBilling(tenantGlobalId)}/recover`,
    );
    return data.url;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export const changeSubscriptionPlan = async (
  tenantGlobalId: string,
  plan: SubscriptionPlan,
): Promise<BillingStatus> => {
  try {
    const { data } = await axios.put<BillingStatus>(ApiPaths.tenants.subscriptionPlan(tenantGlobalId), { plan });
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};

export const cancelScheduledPlanChange = async (tenantGlobalId: string): Promise<BillingStatus> => {
  try {
    const { data } = await axios.post<BillingStatus>(
      `${ApiPaths.tenants.subscriptionPlan(tenantGlobalId)}/cancelScheduledChange`,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    throw error;
  }
};
