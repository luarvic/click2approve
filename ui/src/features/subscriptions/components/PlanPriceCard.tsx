import type { SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanCardHeader from "@/features/subscriptions/components/PlanCardHeader";
import AppCard from "@/shared/components/papers/AppCard";
import { CardActions, CardContent, Stack, Typography, type SxProps, type Theme } from "@mui/material";
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
const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });
const exampleTokens = (prices: Record<string, number> = {}) =>
  10 * (prices.FileUpload ?? 0) +
  10 * (prices.FileDownload ?? 0) +
  5 * (prices.WorkflowEmail ?? 0) +
  (prices.RequestSubmission ?? 0) +
  5 * (prices.TaskCreation ?? 0) +
  5 * (prices.TaskCompletion ?? 0);
const priceLabels: Record<string, string> = {
  FileUpload: "Upload / MB",
  FileDownload: "View or download / MB",
  WorkflowEmail: "Email / recipient",
  RequestSubmission: "Submit request",
  RequestResubmission: "Resubmit request",
  TaskCreation: "Create task",
  TaskCompletion: "Complete task",
  RequestCancellation: "Cancel request",
  RequestRead: "Request read",
  TaskRead: "Task read",
};

/** Displays a subscription plan's price limits, status, and available actions. */
const PlanPriceCard = ({ actions, highlighted = false, limits, status, subtitle, title }: PlanPriceCardProps) => (
  <AppCard elevated sx={[cardSx, ...(highlighted ? [highlightedCardSx] : [])]}>
    <CardContent sx={contentSx}>
      <PlanCardHeader status={status} subtitle={subtitle} title={title} />
      {limits && (
        <Stack spacing={limitsSpacing} sx={limitsSx}>
          <Typography variant="h5">${limits.monthlyPriceUsd} USD / month</Typography>
          <Typography variant="body2" color="text.secondary">
            Excluding taxes
          </Typography>
          <Typography>{numberFormat.format(limits.tokensPerMonth)} tokens included</Typography>
          <Typography>{limits.storageGigabytes} GB storage</Typography>
          <Typography>{limits.configurableRetention ? "Configurable retention" : "1 month retention"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {limits.plan === "BusinessTrial"
              ? "One month only. Tokens are granted once."
              : "Tokens renew each billing period."}{" "}
            Unused tokens expire. Storage is a separate limit.
          </Typography>
          {Object.entries(priceLabels)
            .filter(
              ([action]) =>
                !["RequestCancellation", "RequestRead", "TaskRead"].includes(action) ||
                (limits.tokenPrices?.[action] ?? 0) > 0,
            )
            .map(([action, label]) => (
              <Typography key={action} variant="body2" color="text.secondary">
                {label}: {numberFormat.format(limits.tokenPrices?.[action] ?? 0)} tokens
              </Typography>
            ))}
          <Typography variant="body2" color="text.secondary">
            Example: 10 MB uploaded, 10 MB downloaded, five emails, one request, and five tasks created and completed
            use {numberFormat.format(exampleTokens(limits.tokenPrices))} tokens.
          </Typography>
        </Stack>
      )}
    </CardContent>
    <CardActions>{actions}</CardActions>
  </AppCard>
);

export default PlanPriceCard;
