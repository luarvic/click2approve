import {
  getRetentionPolicy,
  RetentionPolicy,
  saveRetentionPolicy,
} from "@/features/subscriptions/api/subscriptionsApi";
import RetentionControl from "@/features/subscriptions/components/RetentionControl";
import { RetentionLimits } from "@/features/subscriptions/config/retentionLimits";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { StackSpacing } from "@/shared/theme/tokens";
import { notification } from "@/shared/utils/notifications";
import { FormHelperText, Stack, type SxProps, type Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const retentionControlsSx: SxProps<Theme> = { maxWidth: "40rem", py: 2, width: "100%" };

const SubscriptionRetentionPage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const [policy, setPolicy] = useState<RetentionPolicy>();
  const [approvalRequestMonths, setApprovalRequestMonths] = useState(1);
  const [inAppNotificationMonths, setInAppNotificationMonths] = useState(1);
  const [saving, setSaving] = useState(false);
  const retentionRule = (value: string) =>
    Number.isInteger(Number(value)) &&
    Number(value) >= RetentionLimits.neverDeleteMonths &&
    Number(value) <= RetentionLimits.maximumMonths
      ? undefined
      : `Choose a retention period between ${RetentionLimits.neverDeleteMonths} and ${RetentionLimits.maximumMonths.toLocaleString()} months.`;
  const validation = useFormValidation(
    { approvalRequestMonths: String(approvalRequestMonths), inAppNotificationMonths: String(inAppNotificationMonths) },
    { approvalRequestMonths: retentionRule, inAppNotificationMonths: retentionRule },
  );
  usePageTitle("Retention");

  useEffect(() => {
    if (!tenantGlobalId) return;
    void getRetentionPolicy(tenantGlobalId).then((loadedPolicy) => {
      setPolicy(loadedPolicy);
      setApprovalRequestMonths(loadedPolicy.approvalRequestMonths);
      setInAppNotificationMonths(loadedPolicy.inAppNotificationMonths);
    });
  }, [tenantGlobalId]);

  const save = () => {
    if (!tenantGlobalId || !policy || !validation.validate()) return;
    setSaving(true);
    void saveRetentionPolicy(tenantGlobalId, {
      approvalRequestMonths,
      inAppNotificationMonths,
    })
      .then((savedPolicy) => {
        setPolicy(savedPolicy);
        setApprovalRequestMonths(savedPolicy.approvalRequestMonths);
        setInAppNotificationMonths(savedPolicy.inAppNotificationMonths);
        notification.success("Retention policy saved successfully.");
      })
      .finally(() => setSaving(false));
  };

  if (!policy) return null;
  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          {
            label: "Retention",
            titleAction: <HelpPopover helpText="Set how long your workspace data is retained." />,
          },
        ]}
      />
      <Stack component="form" noValidate spacing={StackSpacing.loose} sx={Forms.contentStackSx}>
        <Stack spacing={StackSpacing.extraLoose} sx={retentionControlsSx}>
          <RetentionControl
            disabled={!policy.canManage || !policy.approvalRequestMonthsCanBeChanged}
            label="Requests"
            months={approvalRequestMonths}
            onChange={setApprovalRequestMonths}
          />
          {validation.message("approvalRequestMonths") && (
            <FormHelperText error>{validation.message("approvalRequestMonths")}</FormHelperText>
          )}
          <RetentionControl
            disabled={!policy.canManage || !policy.approvalRequestMonthsCanBeChanged}
            label="Notifications"
            months={inAppNotificationMonths}
            onChange={setInAppNotificationMonths}
          />
          {validation.message("inAppNotificationMonths") && (
            <FormHelperText error>{validation.message("inAppNotificationMonths")}</FormHelperText>
          )}
        </Stack>
        {policy.canManage && policy.approvalRequestMonthsCanBeChanged && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
            <MainActionButton loading={saving} onClick={save}>
              Save
            </MainActionButton>
          </Stack>
        )}
      </Stack>
    </NarrowContent>
  );
};

export default SubscriptionRetentionPage;
