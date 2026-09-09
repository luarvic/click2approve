import { stores } from "@/app/rootStore";
import type { BillingStatus, SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import {
  cancelScheduledPlanChange,
  changeSubscriptionPlan,
  getSubscriptionPlans,
  recoverPayment,
  refreshBilling,
} from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
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
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();
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
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfiguration[]>([]);
  const [subscriptionPlansHaveLoaded, setSubscriptionPlansHaveLoaded] = useState(false);
  const subtitle =
    currentTenant?.type === TenantType.Personal
      ? "Plans for your personal workspace"
      : `Plans for ${currentTenant?.businessName}`;
  usePageTitle("Plans");

  useEffect(() => {
    if (!tenantGlobalId) return;
    let active = true;
    setSubscriptionPlansHaveLoaded(false);
    setBilling(undefined);
    setFailed(false);
    stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, 1);
    void Promise.all([getSubscriptionPlans(), refreshBilling(tenantGlobalId)])
      .then(async ([loadedSubscriptionPlans, loadedBilling]) => {
        if (!active) return;
        await stores.tenantStore.load(undefined, tenantGlobalId);
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
  }, [subscriptionPlansLoader, tenantGlobalId]);

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
      billing.paymentRequired ||
      billing.cleanupStarted ||
      billing.pendingPlan !== null ||
      billing.scheduledPlan !== null
    ) {
      return;
    }

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
  };

  const cancelScheduledChange = async () => {
    if (!tenantGlobalId || !canManage || billing.cleanupStarted || billing.paymentRequired) return;
    await cancelAction.run(async () => {
      setBilling(await cancelScheduledPlanChange(tenantGlobalId));
      showPersistenceSuccessNotification(PersistenceSuccessMessages.scheduledPlanChangeCanceled);
    });
  };
  const pay = async () => {
    if (!canManage || billing.cleanupStarted) return;
    await paymentAction.run(async () => {
      if (tenantGlobalId) window.location.assign(await recoverPayment(tenantGlobalId));
    });
  };
  const paymentLabel = billing.cleanupStarted
    ? "Cleanup started"
    : billing.suspendedAt
      ? "Suspended"
      : billing.paymentRequired
        ? "Pending"
        : "Active";
  const paymentColor =
    billing.cleanupStarted || billing.suspendedAt ? "error" : billing.paymentRequired ? "warning" : "success";
  const changesDisabled =
    !canManage ||
    billing.paymentRequired ||
    billing.cleanupStarted ||
    billing.pendingPlan !== null ||
    billing.scheduledPlan !== null ||
    changePlanAction.isRunning ||
    paymentAction.isRunning ||
    cancelAction.isRunning;

  const hasBillingNotice =
    billing.cleanupStarted ||
    billing.suspendedAt ||
    billing.paymentRequired ||
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
          ) : billing.paymentRequired ? (
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
          {billing.pendingPlan !== null && !billing.paymentRequired && (
            <Alert severity="info">
              Your change to {planNames[billing.pendingPlan]} is awaiting payment confirmation. Your existing plan
              remains active.
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
                  {!isCurrentPlan && billing.scheduledPlan !== plan && (
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
                  {billing.scheduledPlan === plan && !billing.cleanupStarted && !billing.paymentRequired && (
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
                        loading={paymentAction.isRunning}
                        disabled={!canManage || changePlanAction.isRunning || cancelAction.isRunning}
                        onClick={() =>
                          void pay().catch(() => {
                            /* API failures are shown by the subscription API. */
                          })
                        }
                      >
                        {billing.paymentRequired || billing.pendingPlan !== null ? "Resolve payment" : "Manage billing"}
                      </LoadingButton>
                    )}
                </>
              }
              highlighted={isCurrentPlan}
              limits={limits}
              stackActions
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
