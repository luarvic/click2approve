import type { SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanCardHeader from "@/features/subscriptions/components/PlanCardHeader";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import AppCard from "@/shared/components/papers/AppCard";
import { Box, CardActions, CardContent, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface PlanPriceCardProps {
  actions: ReactNode;
  highlighted?: boolean;
  limits?: SubscriptionPlanConfiguration;
  status?: ReactNode;
  subtitle?: string;
  title: string;
}

const cardSx: SxProps<Theme> = { display: "flex", flex: 1, flexDirection: "column", minHeight: 280, minWidth: 0 };
const highlightedCardSx: SxProps<Theme> = { borderColor: "primary.main" };
const contentSx: SxProps<Theme> = { flex: 1 };
const limitsSx: SxProps<Theme> = { mt: 1 };
const limitsSpacing = 1;
const taxSx: SxProps<Theme> = { minHeight: "1lh" };
const includedFeaturesSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  m: 0,
  pl: 3,
};
const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });
/** Displays a subscription plan's price limits, status, and available actions. */
const PlanPriceCard = ({ actions, highlighted = false, limits, status, subtitle, title }: PlanPriceCardProps) => (
  <AppCard elevated sx={[cardSx, ...(highlighted ? [highlightedCardSx] : [])]}>
    <CardContent sx={contentSx}>
      <PlanCardHeader status={status} subtitle={subtitle} title={title} />
      {limits && (
        <Stack spacing={limitsSpacing} sx={limitsSx}>
          <Box>
            <Typography variant="h5">
              {limits.monthlyPriceUsd === 0
                ? limits.plan === SubscriptionPlan.BusinessTrial
                  ? "Free for 1 month"
                  : "Free"
                : `$${limits.monthlyPriceUsd} USD / month`}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={taxSx}>
              {limits.monthlyPriceUsd > 0 ? "Excluding taxes" : null}
            </Typography>
          </Box>
          <Box component="ul" sx={includedFeaturesSx}>
            <Typography component="li">{numberFormat.format(limits.tokensPerMonth)} tokens included</Typography>
            <Typography component="li">{limits.storageGigabytes} GB storage</Typography>
            <Typography component="li">
              {limits.configurableRetention ? "Configurable retention" : "1 month retention"}
            </Typography>
          </Box>
        </Stack>
      )}
    </CardContent>
    <CardActions>{actions}</CardActions>
  </AppCard>
);

export default PlanPriceCard;
