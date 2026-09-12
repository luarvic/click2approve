import { stores } from "@/app/rootStore";
import type { BillingStatus, SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import {
  cancelScheduledPlanChange,
  changeSubscriptionPlan,
  getBillingStatus,
  getSubscriptionPlans,
  recoverPayment,
  refreshBilling,
} from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
import { PaymentIssue } from "@/features/subscriptions/models/paymentIssue";
import { SubscriptionPlan, TenantType } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LoadingButton from "@mui/lab/LoadingButton";
import type { SxProps, Theme } from "@mui/material";
import { Alert, Chip, Divider, Grid, Link, Stack, Tooltip, Typography } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

const paymentIssueMessages: Record<PaymentIssue, string> = {
  [PaymentIssue.PaymentMethodRequired]: "Add a payment method to complete this payment.",
  [PaymentIssue.Declined]: "Your payment was declined. Update your payment method.",
  [PaymentIssue.AuthenticationRequired]: "Confirm your payment to complete it.",
  [PaymentIssue.Processing]: "Your payment is processing.",
  [PaymentIssue.PaymentRequired]: "Complete payment to activate your selected plan.",
};
const personalPlans = [SubscriptionPlan.PersonalFree, SubscriptionPlan.PersonalPro];
const businessPlans = [
  SubscriptionPlan.BusinessTrial,
  SubscriptionPlan.BusinessStarter,
  SubscriptionPlan.BusinessStandard,
  SubscriptionPlan.BusinessUltimate,
];
const planNames: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.PersonalFree]: "Personal Free",
  [SubscriptionPlan.PersonalPro]: "Personal Pro",
  [SubscriptionPlan.BusinessTrial]: "Business Trial",
  [SubscriptionPlan.BusinessStarter]: "Business Starter",
  [SubscriptionPlan.BusinessStandard]: "Business Standard",
  [SubscriptionPlan.BusinessUltimate]: "Business Ultimate",
};
const planGridItemSx: SxProps<Theme> = { display: "flex" };
const planHeaderSpacing = 1;
const planGridSpacing = 2;
const billingNoticeSx: SxProps<Theme> = { mb: 2 };
const planUpgradeDividerSx: SxProps<Theme> = { mt: 3 };
const planUpgradeLinkGap = 0.5;
const planUpgradeLinkSx: SxProps<Theme> = {
  alignItems: "center",
  display: "inline-flex",
  gap: planUpgradeLinkGap,
  textDecoration: "none",
};
const planUpgradeTitleSx: SxProps<Theme> = { fontWeight: 600, mt: 2 };
const planUpgradeTextSx: SxProps<Theme> = { mt: 1 };
const calloutActionLinkSx: SxProps<Theme> = [
  planUpgradeLinkSx as SystemStyleObject<Theme>,
  { fontWeight: 600 } as SystemStyleObject<Theme>,
];

const SubscriptionPlansPage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const currentTenant = stores.tenantStore.currentTenant;
  const personalTenant = stores.tenantStore.tenants.find((tenant) => tenant.type === TenantType.Personal);
  const [billing, setBilling] = useState<BillingStatus>();
  const [failed, setFailed] = useState(false);
  const canManage = billing?.canManage === true;
  const cancelAction = useAsyncAction(ActionLoaders.billing.cancelScheduledChange(tenantGlobalId));
  const paymentAction = useAsyncAction(ActionLoaders.billing.recover(tenantGlobalId));
  const plans = currentTenant?.type === TenantType.Personal ? personalPlans : businessPlans;
  const changePlanLoader = ActionLoaders.subscriptionPlan.change(tenantGlobalId);
  const subscriptionPlansLoader = ActionLoaders.subscriptionPlan.load();
  const changePlanAction = useAsyncAction(changePlanLoader);
  const [changingPlan, setChangingPlan] = useState<SubscriptionPlan>();
  const [billingPortalIsOpening, setBillingPortalIsOpening] = useState(false);
  const [plansRefreshVersion, setPlansRefreshVersion] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfiguration[]>([]);
  const [subscriptionPlansHaveLoaded, setSubscriptionPlansHaveLoaded] = useState(false);
  const initialLoad = useRef<{
    tenantGlobalId: string;
    promise: Promise<[SubscriptionPlanConfiguration[], BillingStatus]>;
  }>();
  const subtitle =
    currentTenant?.type === TenantType.Personal
      ? "Plans for your personal workspace"
      : `Plans for ${currentTenant?.businessName}`;
  usePageTitle("Plans");

  useEffect(() => {
    const refreshAfterBrowserBack = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      initialLoad.current = undefined;
      setBillingPortalIsOpening(false);
      setPlansRefreshVersion((version) => version + 1);
    };
    window.addEventListener("pageshow", refreshAfterBrowserBack);
    return () => window.removeEventListener("pageshow", refreshAfterBrowserBack);
  }, []);

  useEffect(() => {
    if (!tenantGlobalId) return;
    let active = true;
    setSubscriptionPlansHaveLoaded(false);
    setBilling(undefined);
    setFailed(false);
    stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, 1);
    // Share the initial request across React effect replays.
    if (initialLoad.current?.tenantGlobalId !== tenantGlobalId) {
      initialLoad.current = {
        tenantGlobalId,
        promise: Promise.all([getSubscriptionPlans(), refreshBilling(tenantGlobalId)]).then(async (result) => {
          if (stores.tenantStore.currentTenant?.globalId === tenantGlobalId) {
            await stores.tenantStore.load(undefined, tenantGlobalId);
          }
          return result;
        }),
      };
    }
    void initialLoad.current.promise
      .then(([loadedSubscriptionPlans, loadedBilling]) => {
        if (active) {
          setSubscriptionPlans(loadedSubscriptionPlans);
          setBilling(loadedBilling);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, -1);
        if (active) {
          setSubscriptionPlansHaveLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [plansRefreshVersion, subscriptionPlansLoader, tenantGlobalId]);

  if (failed) return <Alert severity="error">Unable to load plans and payment status. Refresh to try again.</Alert>;
  if (!stores.tenantStore.hasLoaded || !subscriptionPlansHaveLoaded || !billing) {
    return <LoadingOverlay />;
  }

  const planCards = plans.map((plan) => ({
    isCurrentPlan: currentTenant?.subscriptionPlan === plan,
    limits: subscriptionPlans.find((subscriptionPlan) => subscriptionPlan.plan === plan),
    plan,
  }));

  const changePlan = async (plan: SubscriptionPlan) => {
    if (
      !tenantGlobalId ||
      !canManage ||
      billing.paymentResolutionRequired ||
      billing.cleanupStarted ||
      billing.pendingPlan !== null ||
      billing.scheduledPlan !== null
    ) {
      return;
    }

    try {
      const planChanged = await changePlanAction.run(async () => {
        setChangingPlan(plan);
        try {
          const result = await changeSubscriptionPlan(tenantGlobalId, plan);
          setBilling(result);
          if (result.checkoutUrl) {
            window.location.assign(result.checkoutUrl);
            return false;
          }
          if (result.pendingPlan !== null || result.scheduledPlan !== null) {
            return false;
          }
          await stores.tenantStore.load(undefined, tenantGlobalId);
          return true;
        } finally {
          setChangingPlan(undefined);
        }
      });
      if (planChanged) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.subscriptionPlanChanged);
      }
    } catch (error) {
      const refreshedBilling = await getBillingStatus(tenantGlobalId).catch(() => undefined);
      if (refreshedBilling) setBilling(refreshedBilling);
      throw error;
    }
  };

  const cancelScheduledChange = async () => {
    if (!tenantGlobalId || !canManage || billing.cleanupStarted || billing.paymentResolutionRequired) return;
    await cancelAction.run(async () => {
      setBilling(await cancelScheduledPlanChange(tenantGlobalId));
      showPersistenceSuccessNotification(PersistenceSuccessMessages.scheduledPlanChangeCanceled);
    });
  };
  const pay = async () => {
    if (!canManage || billing.cleanupStarted) return;
    await paymentAction.run(async () => {
      if (!tenantGlobalId) return;

      const billingPortalUrl = await recoverPayment(tenantGlobalId);
      setBillingPortalIsOpening(true);
      try {
        window.location.assign(billingPortalUrl);
      } catch (error) {
        setBillingPortalIsOpening(false);
        throw error;
      }
    });
  };
  const paymentLabel = billing.cleanupStarted
    ? "Cleanup started"
    : billing.suspendedAt
      ? "Suspended"
      : billing.paymentResolutionRequired
        ? "Pending"
        : "Active";
  const paymentColor =
    billing.cleanupStarted || billing.suspendedAt ? "error" : billing.paymentResolutionRequired ? "warning" : "success";
  const changesDisabled =
    !canManage ||
    billing.paymentResolutionRequired ||
    billing.cleanupStarted ||
    billing.pendingPlan !== null ||
    billing.scheduledPlan !== null ||
    changePlanAction.isRunning ||
    billingPortalIsOpening ||
    paymentAction.isRunning ||
    cancelAction.isRunning;

  const hasPaymentIssue = !billing.cleanupStarted && billing.paymentIssue != null;
  const hasBillingNotice =
    hasPaymentIssue ||
    billing.cleanupStarted ||
    billing.suspendedAt ||
    billing.paymentResolutionRequired ||
    billing.recoveryDeadline ||
    billing.pendingPlan !== null ||
    !canManage;

  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          {
            label: "Plans",
            titleAction: (
              <>
                <HelpPopover helpText="Owners and administrators can change plans and manage billing. Paid plans activate after verified payment. Resolve failed payments before the recovery deadline to retain your workspace data." />
              </>
            ),
          },
        ]}
        subtitle={subtitle}
      />
      {hasBillingNotice && (
        <Stack spacing={planHeaderSpacing} sx={billingNoticeSx}>
          {billing.cleanupStarted ? (
            <Alert severity="warning">The recovery period has ended and workspace cleanup has started.</Alert>
          ) : billing.suspendedAt ? (
            <Alert severity="error">Workspace access is suspended because the subscription payment failed.</Alert>
          ) : billing.paymentResolutionRequired && !hasPaymentIssue ? (
            <Alert severity="info">Complete payment to activate your selected plan.</Alert>
          ) : null}
          {billing.recoveryDeadline && (
            <Alert severity="warning">
              Complete payment by {new Date(billing.recoveryDeadline).toLocaleString()}.{" "}
              {currentTenant?.type === TenantType.Personal
                ? "After this deadline, your personal workflow data and uploads will be deleted and your plan will return to Personal Free. Your account and profile will remain."
                : "After this deadline, the organization and its data will be permanently deleted."}
            </Alert>
          )}
          {billing.pendingPlan !== null && !billing.paymentResolutionRequired && (
            <Alert severity="info">
              Your change to {planNames[billing.pendingPlan]} is pending. Your existing plan remains active.
            </Alert>
          )}
          {hasPaymentIssue && (
            <Alert severity={billing.paymentIssue === PaymentIssue.Processing ? "info" : "warning"}>
              {paymentIssueMessages[billing.paymentIssue!] ?? paymentIssueMessages[PaymentIssue.PaymentRequired]}
            </Alert>
          )}
          {!canManage && <Typography>Only an Owner or Admin can change plans or manage billing.</Typography>}
        </Stack>
      )}
      <Grid container spacing={planGridSpacing}>
        {planCards.map(({ isCurrentPlan, limits, plan }) => (
          <Grid item key={plan} md={4} xs={12} sx={planGridItemSx}>
            <PlanPriceCard
              actions={
                <>
                  {!isCurrentPlan && billing.pendingPlan !== plan && billing.scheduledPlan !== plan && (
                    <LoadingButton
                      variant="text"
                      aria-label={`Choose ${planNames[plan]}`}
                      loading={changePlanAction.isRunning && changingPlan === plan}
                      disabled={changesDisabled}
                      onClick={() =>
                        void changePlan(plan).catch(() => {
                          /* API failures are shown by the subscription API. */
                        })
                      }
                    >
                      Choose
                    </LoadingButton>
                  )}
                  {billing.scheduledPlan === plan && !billing.cleanupStarted && !billing.paymentResolutionRequired && (
                    <LoadingButton
                      variant="text"
                      loading={cancelAction.isRunning}
                      disabled={!canManage || paymentAction.isRunning || changePlanAction.isRunning}
                      onClick={() =>
                        void cancelScheduledChange().catch(() => {
                          /* API failures are shown by the subscription API. */
                        })
                      }
                    >
                      Cancel
                    </LoadingButton>
                  )}
                  {(billing.pendingPlan !== null ? billing.pendingPlan === plan : isCurrentPlan) &&
                    !billing.cleanupStarted &&
                    (billing.hasSubscription || billing.pendingPlan !== null) && (
                      <LoadingButton
                        variant="text"
                        loading={paymentAction.isRunning || billingPortalIsOpening}
                        disabled={
                          !canManage || billingPortalIsOpening || changePlanAction.isRunning || cancelAction.isRunning
                        }
                        onClick={() =>
                          void pay().catch(() => {
                            /* API failures are shown by the subscription API. */
                          })
                        }
                      >
                        {billing.paymentResolutionRequired || billing.pendingPlan !== null
                          ? "Resolve payment"
                          : "Manage billing"}
                      </LoadingButton>
                    )}
                </>
              }
              highlighted={isCurrentPlan}
              limits={limits}
              status={
                billing.scheduledPlan === plan ? (
                  <Chip color="info" label="Planned" size="small" />
                ) : isCurrentPlan ? (
                  <Tooltip title={paymentLabel === "Pending" ? "Payment pending" : ""}>
                    <Chip color={paymentColor} label={paymentLabel} size="small" />
                  </Tooltip>
                ) : billing.pendingPlan === plan ? (
                  <Tooltip title="Payment pending">
                    <Chip color="warning" label="Pending" size="small" />
                  </Tooltip>
                ) : undefined
              }
              subtitle={
                billing.scheduledPlan === plan
                  ? billing.scheduledPlanEffectiveAt
                    ? `Effective ${new Date(billing.scheduledPlanEffectiveAt).toLocaleString()}`
                    : "Effective at the next renewal"
                  : undefined
              }
              title={planNames[plan]}
            />
          </Grid>
        ))}
      </Grid>
      {currentTenant?.type === TenantType.Personal && (
        <>
          <Divider sx={planUpgradeDividerSx} />
          <Typography sx={planUpgradeTitleSx}>Need more for your team?</Typography>
          <Typography sx={planUpgradeTextSx}>
            Business plans include employees, teams, templates, and higher limits.
          </Typography>
          <Typography sx={planUpgradeTextSx}>
            <Link component={RouterLink} sx={calloutActionLinkSx} to="/tenants">
              Create an organization
              <ArrowForwardIcon aria-hidden fontSize="inherit" />
            </Link>
          </Typography>
        </>
      )}
      {currentTenant?.type === TenantType.Business && personalTenant && (
        <>
          <Divider sx={planUpgradeDividerSx} />
          <Typography sx={planUpgradeTitleSx}>Just using it for yourself?</Typography>
          <Typography sx={planUpgradeTextSx}>Personal plans are available in your Personal workspace.</Typography>
          <Typography sx={planUpgradeTextSx}>
            <Link component={RouterLink} sx={calloutActionLinkSx} to={`/tenants/${personalTenant.globalId}/plans`}>
              Switch to Personal
              <ArrowForwardIcon aria-hidden fontSize="inherit" />
            </Link>
          </Typography>
        </>
      )}
    </NarrowContent>
  );
};

export default observer(SubscriptionPlansPage);
