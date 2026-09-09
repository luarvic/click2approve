import { stores } from "@/app/rootStore";
import { getSubscriptionPlans, SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, Button, Grid, SxProps, Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const plans = [
  { plan: SubscriptionPlan.BusinessTrial, name: "Business Trial" },
  { plan: SubscriptionPlan.BusinessStarter, name: "Business Starter" },
  { plan: SubscriptionPlan.BusinessStandard, name: "Business Standard" },
  { plan: SubscriptionPlan.BusinessUltimate, name: "Business Ultimate" },
];
const gridSpacing = 2;
const gridItemSx: SxProps<Theme> = { display: "flex" };
const backSx: SxProps<Theme> = { mt: 2 };

interface OrganizationPlanSelectionPageProps {
  businessName: string;
  checkoutIsOpening: boolean;
  onBack: () => void;
  onChoose: (plan: SubscriptionPlan) => Promise<void>;
}

const OrganizationPlanSelectionPage = () => {
  const { businessName, checkoutIsOpening, onBack, onChoose } = useOutletContext<OrganizationPlanSelectionPageProps>();
  const [limits, setLimits] = useState<SubscriptionPlanConfiguration[]>();
  const [failed, setFailed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>();
  const action = useAsyncAction(ActionLoaders.organizationCreation.choosePlan());
  const subscriptionPlansLoader = ActionLoaders.subscriptionPlan.load();
  usePageTitle("Choose plan");

  useEffect(() => {
    let active = true;
    stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, 1);
    void getSubscriptionPlans()
      .then((loaded) => {
        if (active) setLimits(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(subscriptionPlansLoader, -1);
      });
    return () => {
      active = false;
    };
  }, [subscriptionPlansLoader]);

  const choose = async (plan: SubscriptionPlan) => {
    await action.run(async () => {
      setSelectedPlan(plan);
      await onChoose(plan);
    });
  };

  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          { label: "Organizations", to: "/tenants" },
          { label: "New organization", to: "/tenants/new" },
          {
            label: "Choose plan",
            titleAction: (
              <HelpPopover helpText="Choosing a plan creates your organization. Paid workspaces remain restricted until payment succeeds. Business Trial is available once per owner; selecting it again fails validation. Use Back to edit your organization details." />
            ),
          },
        ]}
        subtitle={`Plans for ${businessName}`}
      />
      {failed ? (
        <Alert severity="error">Unable to load plans. Go back and try again.</Alert>
      ) : !limits ? (
        <LoadingOverlay />
      ) : (
        <Grid container spacing={gridSpacing}>
          {plans.map(({ plan, name }) => {
            const configuration = limits.find((item) => item.plan === plan);
            return (
              <Grid item key={plan} md={4} xs={12} sx={gridItemSx}>
                <PlanPriceCard
                  actions={
                    <LoadingButton
                      variant="text"
                      aria-label={`Choose ${name}`}
                      disabled={action.isRunning || checkoutIsOpening}
                      loading={(action.isRunning || checkoutIsOpening) && selectedPlan === plan}
                      onClick={() => void choose(plan)}
                    >
                      Choose
                    </LoadingButton>
                  }
                  limits={configuration}
                  subtitle={plan === SubscriptionPlan.BusinessTrial ? "Available once per owner" : "Payment required"}
                  title={name}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
      <Button sx={backSx} variant="outlined" disabled={action.isRunning || checkoutIsOpening} onClick={onBack}>
        Back
      </Button>
    </NarrowContent>
  );
};

export default OrganizationPlanSelectionPage;
