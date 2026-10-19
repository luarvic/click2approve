import { stores } from "@/app/rootStore";
import { getSubscriptionUsage, SubscriptionUsage } from "@/features/subscriptions/api/subscriptionsApi";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import AppCard from "@/shared/components/papers/AppCard";
import CardHeading from "@/shared/components/papers/CardHeading";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import type { SxProps, Theme } from "@mui/material";
import {
  Box,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const usageGridSpacing = 2;
const lowQuotaThreshold = 0.25;
const criticalQuotaThreshold = 0.1;
const bytesPerGigabyte = 1000 * 1000 * 1000;
const usageDetailSpacing = 1;
const usageDetailsSx: SxProps<Theme> = { mt: 2 };
const usageDetailRowSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
};
const usageProgressSx: SxProps<Theme> = {
  my: 2,
  height: 8,
  borderRadius: 1,
  backgroundColor: "action.selected",
  "& .MuiLinearProgress-bar": { borderRadius: "inherit" },
};

const getBillingPeriodSubtitle = (startsAt: string, endsAt: string) => {
  const periodStart = parseUtcDateTime(startsAt);
  const periodEnd = new Date(parseUtcDateTime(endsAt).getTime() - 1);
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const year = periodEnd.getUTCFullYear();
  const periodStartLabel = dateFormatter.format(periodStart);
  const periodEndLabel = dateFormatter.format(periodEnd);
  return periodStart.getUTCFullYear() === year
    ? `Billing period: ${periodStartLabel}–${periodEndLabel}, ${year}`
    : `Billing period: ${periodStartLabel}, ${periodStart.getUTCFullYear()}–${periodEndLabel}, ${year}`;
};

const SubscriptionUsagePage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [usageHasLoaded, setUsageHasLoaded] = useState(false);
  const usageLoader = ActionLoaders.subscriptionUsage.load(tenantGlobalId);
  usePageTitle("Usage");

  useEffect(() => {
    let active = true;
    setUsage(null);
    setUsageHasLoaded(false);
    if (!tenantGlobalId) {
      return;
    }

    stores.commonStore.updateActionLoadingCounter(usageLoader, 1);
    void getSubscriptionUsage(tenantGlobalId)
      .then((loadedUsage) => {
        if (active) {
          setUsage(loadedUsage);
        }
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(usageLoader, -1);
        if (active) {
          setUsageHasLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [tenantGlobalId, usageLoader]);

  if (!usage || !usageHasLoaded) return null;
  const sortedActions = [...(usage.actions ?? [])].sort(
    (left, right) => right.tokens - left.tokens || left.action.localeCompare(right.action),
  );
  const items = [
    {
      label: "Tokens",
      used: usage.tokenAllowance - usage.tokenBalance,
      limit: usage.tokenAllowance,
      suffix: "",
    },
    {
      label: "Storage",
      used: usage.storageBytes,
      limit: usage.limits.storageGigabytes * bytesPerGigabyte,
      suffix: "bytes",
    },
  ];
  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          {
            label: "Usage",
          },
        ]}
        subtitle={getBillingPeriodSubtitle(usage.usagePeriodStartsAt, usage.usagePeriodEndsAt)}
      />
      <Grid container spacing={usageGridSpacing}>
        {items.map((item) => {
          const limit = item.limit || Math.max(item.used, 1);
          const remaining = Math.max(limit - item.used, 0);
          const remainingRatio = remaining / limit;
          const color =
            remainingRatio < criticalQuotaThreshold
              ? "error"
              : remainingRatio <= lowQuotaThreshold
                ? "warning"
                : "success";
          const format = (value: number) => (item.suffix ? prettyBytes(value) : Math.floor(value).toLocaleString());
          return (
            <Grid
              key={item.label}
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <AppCard>
                <CardContent>
                  <CardHeading variant="cardTitle">{item.label}</CardHeading>
                  <LinearProgress
                    aria-label={`${item.label} usage`}
                    aria-valuetext={`${format(item.used)} used, ${format(remaining)} available`}
                    color={color}
                    variant="determinate"
                    value={Math.min(Math.max((item.used / limit) * 100, 0), 100)}
                    sx={usageProgressSx}
                  />
                  <Stack spacing={usageDetailSpacing}>
                    <Box sx={usageDetailRowSx}>
                      <Typography color="textSecondary">Used</Typography>
                      <Typography>
                        {item.limit ? `${format(item.used)} of ${format(item.limit)}` : format(item.used)}
                      </Typography>
                    </Box>
                    <Box sx={usageDetailRowSx}>
                      <Typography color="textSecondary">Available</Typography>
                      <Typography>{format(remaining)}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </AppCard>
            </Grid>
          );
        })}
      </Grid>
      {!!usage.actions?.length && (
        <Box sx={usageDetailsSx}>
          <TableContainer>
            <Table aria-label="Token usage details" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell align="right" sortDirection="desc">
                    Tokens used
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedActions.map((action) => (
                  <TableRow key={action.action}>
                    <TableCell component="th" scope="row">
                      {action.action.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </TableCell>
                    <TableCell align="right">{Math.floor(action.tokens).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </NarrowContent>
  );
};

export default SubscriptionUsagePage;
