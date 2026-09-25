import { stores } from "@/app/rootStore";
import { getSubscriptionUsage, SubscriptionUsage } from "@/features/subscriptions/api/subscriptionsApi";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Flex } from "@/shared/components/layout/flexStyles";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import AppCard from "@/shared/components/papers/AppCard";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import type { SxProps, Theme } from "@mui/material";
import { Box, CardContent, Grid, Stack, Typography, useTheme } from "@mui/material";
import { yellow } from "@mui/material/colors";
import { BarChart } from "@mui/x-charts/BarChart";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const usageChartHeight = 40;
const usageGridSpacing = 2;
const lowQuotaThreshold = 0.25;
const criticalQuotaThreshold = 0.1;
const usageChartMargin = { bottom: 2.5, left: 0, right: 0, top: 2.5 };
const bytesPerGigabyte = 1000 * 1000 * 1000;
const usageLegendMarkerSize = 16;
const usageLegendSpacing = 1;
const usageLegendSx: SxProps<Theme> = { mt: 0, justifyContent: "flex-start" };
const usageSummarySx: SxProps<Theme> = { mt: 1 };
const usageLegendMarkerSx = (color: string): SxProps<Theme> => ({
  backgroundColor: color,
  borderRadius: "50%",
  flexShrink: 0,
  height: usageLegendMarkerSize,
  width: usageLegendMarkerSize,
});

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
  const theme = useTheme();
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
  const usageChartColors = {
    available: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#D5DEE2",
    healthy: theme.palette.success.main,
    low: yellow[700],
    critical: theme.palette.error.main,
  };
  const items = [
    {
      label: "Requests",
      used: usage.requestsThisMonth,
      limit: usage.limits.requestsPerMonth,
      suffix: "",
    },
    {
      label: "Tasks",
      used: usage.tasksThisMonth,
      limit: usage.limits.tasksPerMonth,
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
            titleAction: (
              <HelpPopover helpText="Review request, task, and storage usage for the current billing period." />
            ),
          },
        ]}
        subtitle={getBillingPeriodSubtitle(usage.usagePeriodStartsAt, usage.usagePeriodEndsAt)}
      />
      <Grid container spacing={usageGridSpacing}>
        {items.map((item) => {
          const limit = item.limit || Math.max(item.used, 1);
          const remaining = Math.max(limit - item.used, 0);
          const remainingRatio = remaining / limit;
          const usedColor =
            remainingRatio < criticalQuotaThreshold
              ? usageChartColors.critical
              : remainingRatio <= lowQuotaThreshold
                ? usageChartColors.low
                : usageChartColors.healthy;
          const format = (value: number) => (item.suffix ? prettyBytes(value) : value.toLocaleString());
          return (
            <Grid
              key={item.label}
              size={{
                md: 4,
                xs: 12,
              }}
            >
              <AppCard elevated>
                <CardContent>
                  <Typography component="h2" variant="h6" color="text.primary">
                    {item.label}
                  </Typography>
                  <BarChart
                    aria-label={`${item.label}: ${format(item.used)} used, ${format(remaining)} available`}
                    axisHighlight={{ y: "none" }}
                    height={usageChartHeight}
                    layout="horizontal"
                    margin={usageChartMargin}
                    series={[
                      { color: usedColor, data: [item.used], label: "Used", stack: "quota" },
                      { color: usageChartColors.available, data: [remaining], label: "Available", stack: "quota" },
                    ]}
                    hideLegend
                    slotProps={{ tooltip: { trigger: "none" } }}
                    xAxis={[{ min: 0, max: Math.max(limit, item.used), position: "none" }]}
                    yAxis={[{ data: [item.label], scaleType: "band", position: "none" }]}
                  />
                  <Stack direction="row" spacing={usageLegendSpacing} sx={usageLegendSx}>
                    {[
                      { color: usedColor, label: "Used" },
                      { color: usageChartColors.available, label: "Available" },
                    ].map((legendItem) => (
                      <Stack
                        direction="row"
                        key={legendItem.label}
                        spacing={usageLegendSpacing}
                        sx={Flex.alignCenterSx}
                      >
                        <Box sx={usageLegendMarkerSx(legendItem.color)} />
                        <Typography>{legendItem.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Typography sx={usageSummarySx}>
                    {item.limit ? `${format(item.used)} of ${format(item.limit)}` : `${format(item.used)} used`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(remaining)} available
                  </Typography>
                </CardContent>
              </AppCard>
            </Grid>
          );
        })}
      </Grid>
    </NarrowContent>
  );
};

export default SubscriptionUsagePage;
