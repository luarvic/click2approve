import { stores } from "@/app/rootStore";
import type { SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import { changeSubscriptionPlan, getSubscriptionPlans } from "@/features/subscriptions/api/subscriptionsApi";
import { SubscriptionPlan, TenantType } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { elevatedStandardCardSx, standardCardSx } from "@/shared/components/papers/StandardCardStyles";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { SxProps, Theme } from "@mui/material";
import { Card, CardActionArea, CardContent, Chip, Divider, Grid, Link, Stack, Typography } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

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
const currentPlanCardSx: SxProps<Theme> = {
  borderColor: "primary.main",
};
const planHeaderSpacing = 1;
const planLimitsSpacing = 1;
const planLimitsSx: SxProps<Theme> = { mt: 1 };
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
const getMonthlyLimitLabel = (limit: number, label: string) =>
  limit ? `${limit.toLocaleString()} ${label} per month` : `Unlimited ${label}`;
const getStorageLimitLabel = (storageGigabytes: number) =>
  storageGigabytes ? `${storageGigabytes.toLocaleString()} GB storage` : "Unlimited storage";
const getPlanCardSx = (isCurrentPlan: boolean): SxProps<Theme> => [
  standardCardSx as SystemStyleObject<Theme>,
  elevatedStandardCardSx as SystemStyleObject<Theme>,
  ...(isCurrentPlan ? [currentPlanCardSx as SystemStyleObject<Theme>] : []),
];

const SubscriptionPlanPage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const currentTenant = stores.tenantStore.currentTenant;
  const personalTenant = stores.tenantStore.tenants.find((tenant) => tenant.type === TenantType.Personal);
  const plans = currentTenant?.type === TenantType.Personal ? personalPlans : businessPlans;
  const changePlanLoader = ActionLoaders.subscriptionPlan.change(tenantGlobalId);
  const subscriptionPlansLoader = ActionLoaders.subscriptionPlan.load();
  const changePlanAction = useAsyncAction(changePlanLoader);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanConfiguration[]>([]);
  const [subscriptionPlansHaveLoaded, setSubscriptionPlansHaveLoaded] = useState(false);
  const subtitle =
    currentTenant?.type === TenantType.Personal
      ? "Plans for your personal workspace"
      : `Plans for ${currentTenant?.businessName}`;
  usePageTitle("Plan");

  useEffect(() => {
    let active = true;
    setSubscriptionPlansHaveLoaded(false);
    stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, 1);
    void getSubscriptionPlans()
      .then((loadedSubscriptionPlans) => {
        if (active) {
          setSubscriptionPlans(loadedSubscriptionPlans);
        }
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
  }, [subscriptionPlansLoader]);

  if (!stores.tenantStore.hasLoaded || !subscriptionPlansHaveLoaded) {
    return <LoadingOverlay />;
  }

  const planCards = plans.map((plan) => ({
    isCurrentPlan: currentTenant?.subscriptionPlan === plan,
    limits: subscriptionPlans.find((subscriptionPlan) => subscriptionPlan.plan === plan),
    plan,
  }));

  const changePlan = async (plan: SubscriptionPlan) => {
    if (!tenantGlobalId) {
      return;
    }

    const planChanged = await changePlanAction.run(async () => {
      await changeSubscriptionPlan(tenantGlobalId, plan);
      await stores.tenantStore.load(undefined, tenantGlobalId);
      return true;
    });
    if (planChanged) {
      showPersistenceSuccessNotification(PersistenceSuccessMessages.subscriptionPlanChanged);
    }
  };

  return (
    <NarrowContent>
      <PageBreadcrumbs items={[{ label: "Plan" }]} subtitle={subtitle} />
      <Grid container spacing={2}>
        {planCards.map(({ isCurrentPlan, limits, plan }) => (
          <Grid item key={plan} md={4} xs={12}>
            <Card sx={getPlanCardSx(isCurrentPlan)}>
              <CardActionArea
                disabled={changePlanAction.isRunning || isCurrentPlan}
                onClick={() => void changePlan(plan)}
              >
                <CardContent>
                  <Stack alignItems="center" direction="row" spacing={planHeaderSpacing}>
                    <Typography variant="h6">{planNames[plan]}</Typography>
                    {isCurrentPlan && <Chip color="primary" label="Current" size="small" />}
                  </Stack>
                  {limits && (
                    <Stack spacing={planLimitsSpacing} sx={planLimitsSx}>
                      <Typography color="text.secondary">
                        {getMonthlyLimitLabel(limits.requestsPerMonth, "requests")}
                      </Typography>
                      <Typography color="text.secondary">
                        {getMonthlyLimitLabel(limits.tasksPerMonth, "tasks")}
                      </Typography>
                      <Typography color="text.secondary">{getStorageLimitLabel(limits.storageGigabytes)}</Typography>
                    </Stack>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
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
            <Link component={RouterLink} sx={calloutActionLinkSx} to="/tenants/new">
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
            <Link
              component={RouterLink}
              sx={calloutActionLinkSx}
              to={`/tenants/${personalTenant.globalId}/subscription/plan`}
            >
              Switch to Personal
              <ArrowForwardIcon aria-hidden fontSize="inherit" />
            </Link>
          </Typography>
        </>
      )}
    </NarrowContent>
  );
};

export default observer(SubscriptionPlanPage);
