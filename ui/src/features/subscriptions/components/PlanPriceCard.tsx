import type { SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanCardHeader from "@/features/subscriptions/components/PlanCardHeader";
import AppCard from "@/shared/components/papers/AppCard";
import { CardActions, CardContent, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface PlanPriceCardProps {
  actions: ReactNode;
  highlighted?: boolean;
  limits?: SubscriptionPlanConfiguration;
  stackActions?: boolean;
  status?: ReactNode;
  subtitle?: string;
  title: string;
}

const cardSx: SxProps<Theme> = { display: "flex", flex: 1, flexDirection: "column", minHeight: 280, minWidth: 0 };
const highlightedCardSx: SxProps<Theme> = { borderColor: "primary.main" };
const contentSx: SxProps<Theme> = { flex: 1 };
const limitsSx: SxProps<Theme> = { mt: 1 };
const limitsSpacing = 1;
const stackedActionsSx: SxProps<Theme> = {
  alignItems: "stretch",
  flexDirection: "column",
  gap: 1,
  "& > :not(style) ~ :not(style)": { ml: 0 },
};

const getMonthlyLimitLabel = (limit: number, label: string) =>
  limit ? `${limit.toLocaleString()} ${label} per month` : `Unlimited ${label}`;
const getStorageLimitLabel = (storageGigabytes: number) =>
  storageGigabytes ? `${storageGigabytes.toLocaleString()} GB storage` : "Unlimited storage";

/** Displays a subscription plan's price limits, status, and available actions. */
const PlanPriceCard = ({
  actions,
  highlighted = false,
  limits,
  stackActions = false,
  status,
  subtitle,
  title,
}: PlanPriceCardProps) => (
  <AppCard elevated sx={[cardSx, ...(highlighted ? [highlightedCardSx] : [])]}>
    <CardContent sx={contentSx}>
      <PlanCardHeader status={status} subtitle={subtitle} title={title} />
      {limits && (
        <Stack spacing={limitsSpacing} sx={limitsSx}>
          <Typography color="text.secondary">{getMonthlyLimitLabel(limits.requestsPerMonth, "requests")}</Typography>
          <Typography color="text.secondary">{getMonthlyLimitLabel(limits.tasksPerMonth, "tasks")}</Typography>
          <Typography color="text.secondary">{getStorageLimitLabel(limits.storageGigabytes)}</Typography>
        </Stack>
      )}
    </CardContent>
    <CardActions sx={stackActions ? stackedActionsSx : undefined}>{actions}</CardActions>
  </AppCard>
);

export default PlanPriceCard;
