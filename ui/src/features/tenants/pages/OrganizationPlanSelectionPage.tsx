import { stores } from "@/app/rootStore";
import { getSubscriptionPlans, SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { Flex } from "@/shared/components/layout/flexStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Alert, Button, FormControlLabel, Grid, Radio, RadioGroup, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

const plans = [
  { plan: SubscriptionPlan.BusinessTrial, name: "Business Trial" },
  { plan: SubscriptionPlan.BusinessPro, name: "Business Pro" },
];
const gridSpacing = 2;

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

  const choose = async () => {
    if (!selectedPlan) return;
    await action.run(() => onChoose(selectedPlan));
  };
  const busy = action.isRunning || checkoutIsOpening;
  const selectedPlanName = plans.find(({ plan }) => plan === selectedPlan)?.name;

  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          { label: "Organizations", to: "/tenants" },
          { label: "New organization", to: "/tenants/new" },
          {
            label: "Choose plan",
          },
        ]}
        subtitle={`Plans for ${businessName}`}
      />
      {failed ? (
        <Alert severity="error">Unable to load plans. Go back and try again.</Alert>
      ) : !limits ? (
        <LoadingOverlay />
      ) : (
        <RadioGroup
          aria-label="Organization plan"
          value={selectedPlan ?? ""}
          onChange={(event) => setSelectedPlan(event.target.value as SubscriptionPlan)}
        >
          <Grid container spacing={gridSpacing}>
            {plans.map(({ plan, name }) => {
              const configuration = limits.find((item) => item.plan === plan);
              return (
                <Grid
                  key={plan}
                  sx={Flex.displaySx}
                  size={{
                    md: 6,
                    xs: 12,
                  }}
                >
                  <PlanPriceCard
                    actions={
                      <FormControlLabel control={<Radio />} disabled={busy} label={`Choose ${name}`} value={plan} />
                    }
                    highlighted={selectedPlan === plan}
                    limits={configuration}
                    subtitle={plan === SubscriptionPlan.BusinessTrial ? "Available once per owner" : "Payment required"}
                    title={name}
                  />
                </Grid>
              );
            })}
          </Grid>
        </RadioGroup>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
        <Button variant="text" disabled={busy} onClick={onBack}>
          Back
        </Button>
        {limits && !failed && (
          <MainActionButton
            aria-label={selectedPlanName ? `Subscribe to ${selectedPlanName}` : "Subscribe"}
            disabled={!selectedPlan || busy}
            loading={busy}
            onClick={() => void choose()}
          >
            Subscribe
          </MainActionButton>
        )}
      </Stack>
    </NarrowContent>
  );
};

export default OrganizationPlanSelectionPage;
