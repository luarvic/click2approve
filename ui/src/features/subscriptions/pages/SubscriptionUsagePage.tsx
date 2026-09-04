import { stores } from "@/app/rootStore";
import { getSubscriptionUsage, SubscriptionUsage } from "@/features/subscriptions/api/subscriptionsApi";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { elevatedStandardCardSx, standardCardSx } from "@/shared/components/papers/StandardCardStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import type { SxProps, Theme } from "@mui/material";
import { Box, Card, CardContent, Grid, Stack, Typography, useTheme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import { PieChart } from "@mui/x-charts/PieChart";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const usageChartHeight = 200;
const usageChartMargin = { bottom: 5, left: 5, right: 5, top: 5 };
const bytesPerGigabyte = 1000 * 1000 * 1000;
const usageLegendMarkerSize = 16;
const usageLegendSpacing = 1;
const usageLegendSx: SxProps<Theme> = { mt: 0 };
const usageSummarySx: SxProps<Theme> = { mt: 1 };
const usageCardSx: SxProps<Theme> = [
  standardCardSx as SystemStyleObject<Theme>,
  elevatedStandardCardSx as SystemStyleObject<Theme>,
];
const usageLegendMarkerSx = (color: string): SxProps<Theme> => ({
  backgroundColor: color,
  borderRadius: "50%",
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
    used: "#22c55e",
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
      <Grid container spacing={2}>
        {items.map((item) => {
          const limit = item.limit || Math.max(item.used, 1);
          const remaining = Math.max(limit - item.used, 0);
          const format = (value: number) => (item.suffix ? prettyBytes(value) : value.toLocaleString());
          return (
            <Grid item key={item.label} md={4} xs={12}>
              <Card sx={usageCardSx}>
                <CardContent>
                  <Typography color="text.primary" component="h2" variant="h6">
                    {item.label}
                  </Typography>
                  <PieChart
                    height={usageChartHeight}
                    margin={usageChartMargin}
                    series={[
                      {
                        data: [
                          { color: usageChartColors.used, id: 0, label: "Used", value: item.used },
                          { color: usageChartColors.available, id: 1, label: "Available", value: remaining },
                        ],
                      },
                    ]}
                    slotProps={{
                      legend: {
                        hidden: true,
                      },
                    }}
                    tooltip={{ trigger: "none" }}
                  />
                  <Stack direction="row" justifyContent="flex-start" spacing={usageLegendSpacing} sx={usageLegendSx}>
                    {[
                      { color: usageChartColors.used, label: "Used" },
                      { color: usageChartColors.available, label: "Available" },
                    ].map((legendItem) => (
                      <Stack alignItems="center" direction="row" key={legendItem.label} spacing={usageLegendSpacing}>
                        <Box sx={usageLegendMarkerSx(legendItem.color)} />
                        <Typography>{legendItem.label}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Typography sx={usageSummarySx}>
                    {item.limit ? `${format(item.used)} of ${format(item.limit)}` : `${format(item.used)} used`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </NarrowContent>
  );
};

export default SubscriptionUsagePage;
