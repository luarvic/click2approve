import { stores } from "@/app/rootStore";
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
import InlineNotice from "@/shared/components/status/InlineNotice";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { StackSpacing } from "@/shared/theme/tokens";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import { FormHelperText, Stack, type SxProps, type Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const retentionControlsSx: SxProps<Theme> = { maxWidth: "40rem", py: 2, width: "100%" };

const SubscriptionRetentionPage = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [policy, setPolicy] = useState<RetentionPolicy>();
  const [approvalRequestMonths, setApprovalRequestMonths] = useState(1);
  const [inAppNotificationMonths, setInAppNotificationMonths] = useState(1);
  const saveAction = useAsyncAction(ActionLoaders.subscriptionRetention.save(tenantGlobalId));
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
    let active = true;
    const loader = ActionLoaders.subscriptionRetention.load(tenantGlobalId);
    setPolicy(undefined);
    setLoadFailed(false);
    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void getRetentionPolicy(tenantGlobalId)
      .then((loadedPolicy) => {
        if (active) {
          setPolicy(loadedPolicy);
          setApprovalRequestMonths(loadedPolicy.approvalRequestMonths);
          setInAppNotificationMonths(loadedPolicy.inAppNotificationMonths);
        }
      })
      .catch((error) => {
        if (active) {
          setLoadFailed(true);
          notification.error(getApiErrorNotification(error));
        }
      })
      .finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
    return () => {
      active = false;
    };
  }, [tenantGlobalId]);

  const save = () => {
    if (!tenantGlobalId || !policy) return;
    if (!validation.validate()) {
      notification.validationWarning();
      return;
    }
    void saveAction.run(async () => {
      const savedPolicy = await saveRetentionPolicy(tenantGlobalId, {
        approvalRequestMonths,
        inAppNotificationMonths,
      });
      setPolicy(savedPolicy);
      setApprovalRequestMonths(savedPolicy.approvalRequestMonths);
      setInAppNotificationMonths(savedPolicy.inAppNotificationMonths);
      notification.success("Retention policy saved successfully.");
    });
  };

  if (loadFailed) {
    return <InlineNotice severity="error">Unable to load retention settings. Refresh to try again.</InlineNotice>;
  }
  if (!policy) return null;
  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[
          {
            label: "Retention",
          },
        ]}
      />
      <Stack component="form" noValidate spacing={StackSpacing.loose}>
        <Stack spacing={StackSpacing.extraLoose} sx={retentionControlsSx}>
          <RetentionControl
            disabled={!policy.canManage || !policy.approvalRequestMonthsCanBeChanged}
            label={policy.approvalRequestMonthsCanBeChanged ? "Requests and receipts" : "Requests"}
            months={approvalRequestMonths}
            onChange={setApprovalRequestMonths}
          />
          {validation.message("approvalRequestMonths") && (
            <FormHelperText error>{validation.message("approvalRequestMonths")}</FormHelperText>
          )}
          {!policy.approvalRequestMonthsCanBeChanged && (
            <RetentionControl disabled label="Receipts" months={policy.receiptMonths} onChange={() => {}} />
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
            <MainActionButton loading={saveAction.isRunning} onClick={save}>
              Save
            </MainActionButton>
          </Stack>
        )}
      </Stack>
    </NarrowContent>
  );
};

export default SubscriptionRetentionPage;
