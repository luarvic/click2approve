import { stores } from "@/app/rootStore";
import type {
  BillingStatus,
  SubscriptionPlanConfiguration,
  SubscriptionUsage,
} from "@/features/subscriptions/api/subscriptionsApi";
import {
  cancelPendingPlanChange,
  cancelScheduledPlanChange,
  changeSubscriptionPlan,
  getBillingStatus,
  getSubscriptionPlans,
  getSubscriptionUsage,
  recoverPayment,
  refreshBilling,
} from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
import { PaymentIssue } from "@/features/subscriptions/models/paymentIssue";
import { SubscriptionPlan, TenantType } from "@/features/tenants/models/tenant";
import { Flex } from "@/shared/components/layout/flexStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import InlineNotice from "@/shared/components/status/InlineNotice";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { SxProps, Theme } from "@mui/material";
import { Chip, Divider, Grid, Link, Stack, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
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
  const requiresTrialUsage = currentTenant?.subscriptionPlan === SubscriptionPlan.BusinessTrial;
  const personalTenant = stores.tenantStore.tenants.find((tenant) => tenant.type === TenantType.Personal);
  const [billing, setBilling] = useState<BillingStatus>();
  const [failed, setFailed] = useState(false);
  const canManage = billing?.canManage === true;
  const cancelPendingAction = useAsyncAction(ActionLoaders.billing.cancelPendingChange(tenantGlobalId));
  const cancelAction = useAsyncAction(ActionLoaders.billing.cancelScheduledChange(tenantGlobalId));
  const paymentAction = useAsyncAction(ActionLoaders.billing.recover(tenantGlobalId));
  const plans = currentTenant?.type === TenantType.Personal ? personalPlans : businessPlans;
  const changePlanLoader = ActionLoaders.subscriptionPlan.change(tenantGlobalId);
  const subscriptionPlansLoader = ActionLoaders.subscriptionPlan.load();
  const changePlanAction = useAsyncAction(changePlanLoader);
  const [checkoutOpeningPlan, setCheckoutOpeningPlan] = useState<SubscriptionPlan>();
  const [changingPlan, setChangingPlan] = useState<SubscriptionPlan>();
  const [billingPortalIsOpening, setBillingPortalIsOpening] = useState(false);
  const [plansRefreshVersion, setPlansRefreshVersion] = useState(0);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfiguration[]>([]);
  const [subscriptionPlansHaveLoaded, setSubscriptionPlansHaveLoaded] = useState(false);
  const [trialUsage, setTrialUsage] = useState<SubscriptionUsage>();
  const initialLoad = useRef<
    | {
        tenantGlobalId: string;
        requiresTrialUsage: boolean;
        promise: Promise<[SubscriptionPlanConfiguration[], BillingStatus, SubscriptionUsage | undefined]>;
      }
    | undefined
  >(undefined);
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
      setCheckoutOpeningPlan(undefined);
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
    setTrialUsage(undefined);
    stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, 1);
    // Share the initial request across React effect replays.
    if (
      initialLoad.current?.tenantGlobalId !== tenantGlobalId ||
      initialLoad.current.requiresTrialUsage !== requiresTrialUsage
    ) {
      initialLoad.current = {
        tenantGlobalId,
        requiresTrialUsage,
        promise: Promise.all([
          getSubscriptionPlans(),
          refreshBilling(tenantGlobalId),
          requiresTrialUsage ? getSubscriptionUsage(tenantGlobalId) : Promise.resolve(undefined),
        ]).then(async (result) => {
          if (stores.tenantStore.currentTenant?.globalId === tenantGlobalId) {
            await stores.tenantStore.load(undefined, tenantGlobalId);
          }
          return result;
        }),
      };
    }
    void initialLoad.current.promise
      .then(([loadedSubscriptionPlans, loadedBilling, loadedTrialUsage]) => {
        if (active) {
          setSubscriptionPlans(loadedSubscriptionPlans);
          setBilling(loadedBilling);
          setTrialUsage(loadedTrialUsage);
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
  }, [plansRefreshVersion, requiresTrialUsage, subscriptionPlansLoader, tenantGlobalId]);

  if (failed)
    return <InlineNotice severity="error">Unable to load plans and payment status. Refresh to try again.</InlineNotice>;
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
      billing.scheduledPlan !== null ||
      checkoutOpeningPlan !== undefined
    ) {
      return;
    }

    try {
      const planChanged = await changePlanAction.run(async () => {
        setChangingPlan(plan);
        try {
          const result = await changeSubscriptionPlan(tenantGlobalId, plan);
          if (result.checkoutUrl) {
            setCheckoutOpeningPlan(plan);
            window.location.assign(result.checkoutUrl);
            return false;
          }
          setBilling(result);
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
      setCheckoutOpeningPlan(undefined);
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
  const cancelPendingChange = async () => {
    if (!tenantGlobalId || !canManage || billing.cleanupStarted || billing.paymentResolutionRequired) return;
    await cancelPendingAction.run(async () => {
      const previousPlan = currentTenant?.subscriptionPlan;
      const result = await cancelPendingPlanChange(tenantGlobalId);
      setBilling(result);
      await stores.tenantStore.load(undefined, tenantGlobalId);
      if (result.pendingPlan === null) {
        showPersistenceSuccessNotification(
          stores.tenantStore.currentTenant?.subscriptionPlan === previousPlan
            ? PersistenceSuccessMessages.pendingPlanChangeCanceled
            : PersistenceSuccessMessages.subscriptionPlanChanged,
        );
      }
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
    billing.cleanupStarted || billing.suspendedAt ? "error" : billing.paymentResolutionRequired ? "warning" : "primary";
  const businessTrialHasEnded =
    currentTenant?.subscriptionPlan === SubscriptionPlan.BusinessTrial &&
    trialUsage !== undefined &&
    parseUtcDateTime(trialUsage.usagePeriodEndsAt) <= new Date();
  const changesDisabled =
    !canManage ||
    billing.paymentResolutionRequired ||
    billing.cleanupStarted ||
    billing.pendingPlan !== null ||
    billing.scheduledPlan !== null ||
    changePlanAction.isRunning ||
    checkoutOpeningPlan !== undefined ||
    billingPortalIsOpening ||
    paymentAction.isRunning ||
    cancelAction.isRunning ||
    cancelPendingAction.isRunning;

  const hasPaymentIssue = !billing.cleanupStarted && billing.paymentIssue != null;
  const hasBillingNotice =
    hasPaymentIssue ||
    billing.cleanupStarted ||
    billing.suspendedAt ||
    billing.paymentResolutionRequired ||
    billing.recoveryDeadline ||
    billing.pendingPlan !== null ||
    businessTrialHasEnded ||
    !canManage;

  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          {
            label: "Plans",
            titleAction: (
              <>
                <HelpPopover helpText="Owners and administrators can change plans and manage billing. Paid plans activate after verified payment. Cancel an unpaid plan change to keep your current plan. Resolve failed payments before the recovery deadline to retain your workspace data." />
              </>
            ),
          },
        ]}
        subtitle={subtitle}
      />
      {hasBillingNotice && (
        <Stack spacing={planHeaderSpacing} sx={billingNoticeSx}>
          {billing.cleanupStarted ? (
            <InlineNotice severity="warning">
              The recovery period has ended and workspace cleanup has started.
            </InlineNotice>
          ) : billing.suspendedAt ? (
            <InlineNotice severity="error">
              Workspace access is suspended because the subscription payment failed.
            </InlineNotice>
          ) : billing.paymentResolutionRequired && !hasPaymentIssue ? (
            <InlineNotice severity="info">Complete payment to activate your selected plan.</InlineNotice>
          ) : null}
          {billing.recoveryDeadline && (
            <InlineNotice severity="warning">
              Complete payment by {new Date(billing.recoveryDeadline).toLocaleString()}.{" "}
              {currentTenant?.type === TenantType.Personal
                ? "After this deadline, your personal workflow data and uploads will be deleted and your plan will return to Personal Free. Your account and profile will remain."
                : "After this deadline, the organization and its data will be permanently deleted."}
            </InlineNotice>
          )}
          {businessTrialHasEnded && (
            <InlineNotice severity="warning">
              Your Business Trial has ended. Choose a paid plan to continue using your workspace.
            </InlineNotice>
          )}
          {billing.pendingPlan !== null && !billing.paymentResolutionRequired && (
            <InlineNotice severity="info">
              Your change to {planNames[billing.pendingPlan]} is pending. Your existing plan remains active.
            </InlineNotice>
          )}
          {hasPaymentIssue && (
            <InlineNotice severity={billing.paymentIssue === PaymentIssue.Processing ? "info" : "warning"}>
              {paymentIssueMessages[billing.paymentIssue!] ?? paymentIssueMessages[PaymentIssue.PaymentRequired]}
            </InlineNotice>
          )}
          {!canManage && <Typography>Only an Owner or Admin can change plans or manage billing.</Typography>}
        </Stack>
      )}
      <Grid container spacing={planGridSpacing}>
        {planCards.map(({ isCurrentPlan, limits, plan }) => (
          <Grid
            key={plan}
            sx={Flex.displaySx}
            size={{
              md: 4,
              xs: 12,
            }}
          >
            <PlanPriceCard
              actions={
                <>
                  {!isCurrentPlan && billing.pendingPlan !== plan && billing.scheduledPlan !== plan && (
                    <Button
                      size="small"
                      variant="text"
                      aria-label={`Choose ${planNames[plan]}`}
                      loading={(changePlanAction.isRunning && changingPlan === plan) || checkoutOpeningPlan === plan}
                      disabled={changesDisabled}
                      onClick={() =>
                        void changePlan(plan).catch(() => {
                          /* API failures are shown by the subscription API. */
                        })
                      }
                    >
                      Choose
                    </Button>
                  )}
                  {billing.scheduledPlan === plan && !billing.cleanupStarted && !billing.paymentResolutionRequired && (
                    <Button
                      size="small"
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
                    </Button>
                  )}
                  {billing.pendingPlan === plan &&
                    !isCurrentPlan &&
                    !billing.cleanupStarted &&
                    !billing.paymentResolutionRequired && (
                      <Button
                        size="small"
                        variant="text"
                        loading={cancelPendingAction.isRunning}
                        disabled={
                          !canManage || paymentAction.isRunning || billingPortalIsOpening || changePlanAction.isRunning
                        }
                        onClick={() =>
                          void cancelPendingChange().catch(() => {
                            /* API failures are shown by the subscription API. */
                          })
                        }
                      >
                        Cancel change
                      </Button>
                    )}
                  {(billing.pendingPlan !== null ? billing.pendingPlan === plan : isCurrentPlan) &&
                    !billing.cleanupStarted &&
                    (billing.hasSubscription || billing.pendingPlan !== null) && (
                      <Button
                        size="small"
                        variant="text"
                        loading={paymentAction.isRunning || billingPortalIsOpening}
                        disabled={
                          !canManage ||
                          billingPortalIsOpening ||
                          checkoutOpeningPlan !== undefined ||
                          changePlanAction.isRunning ||
                          cancelAction.isRunning ||
                          cancelPendingAction.isRunning
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
                      </Button>
                    )}
                </>
              }
              highlighted={isCurrentPlan}
              limits={limits}
              status={
                billing.scheduledPlan === plan ? (
                  <Chip color="info" label="Planned" size="small" variant="outlined" />
                ) : isCurrentPlan ? (
                  <Tooltip
                    title={
                      businessTrialHasEnded
                        ? "Choose a paid plan to continue"
                        : paymentLabel === "Pending"
                          ? "Payment pending"
                          : ""
                    }
                  >
                    <Chip
                      color={businessTrialHasEnded ? "warning" : paymentColor}
                      label={businessTrialHasEnded ? "Trial ended" : paymentLabel}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                ) : billing.pendingPlan === plan ? (
                  <Tooltip title="Payment pending">
                    <Chip color="warning" label="Pending" size="small" variant="outlined" />
                  </Tooltip>
                ) : undefined
              }
              subtitle={
                billing.scheduledPlan === plan
                  ? billing.scheduledPlanEffectiveAt
                    ? `Effective ${new Date(billing.scheduledPlanEffectiveAt).toLocaleString()}`
                    : "Effective at the next renewal"
                  : isCurrentPlan && plan === SubscriptionPlan.BusinessTrial && trialUsage
                    ? `Expires ${new Date(trialUsage.usagePeriodEndsAt).toLocaleString()}`
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
