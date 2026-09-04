import { stores } from "@/app/rootStore";
import { SubscriptionPlan, TenantType } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { standardCardSx } from "@/shared/components/papers/StandardCardStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const personalPlans = [
  SubscriptionPlan.PersonalFree,
  SubscriptionPlan.PersonalPro,
];
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

const SubscriptionPlanPage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const navigate = useNavigate();
  const plans =
    stores.tenantStore.currentTenant?.type === TenantType.Personal
      ? personalPlans
      : businessPlans;
  usePageTitle("Subscription plan");
  return (
    <NarrowContent>
      <PageBreadcrumbs items={[{ label: "Subscription" }, { label: "Plan" }]} />
      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid item key={plan} md={4} xs={12}>
            <Card sx={standardCardSx}>
              <CardActionArea
                onClick={() =>
                  navigate(
                    `/tenants/${tenantGlobalId}/subscription/billing?plan=${plan}`,
                  )
                }
              >
                <CardContent>
                  <Typography variant="h6">{planNames[plan]}</Typography>
                  <Typography>Select this plan</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </NarrowContent>
  );
};

export default SubscriptionPlanPage;
