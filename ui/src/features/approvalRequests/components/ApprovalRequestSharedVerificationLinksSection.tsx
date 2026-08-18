import {
  createSharedVerificationLinkForRequest,
  createSharedVerificationLinkForTask,
} from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { LinkOutlined } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useState } from "react";

interface ApprovalRequestSharedVerificationLinksSectionProps {
  onClose: () => void;
  resource: { globalId: string; type: "request" | "task" };
  tenantGlobalId: string;
}

const ApprovalRequestSharedVerificationLinksSection: React.FC<ApprovalRequestSharedVerificationLinksSectionProps> = ({
  onClose,
  resource,
  tenantGlobalId,
}) => {
  const [hasSharedVerificationLink, setHasSharedVerificationLink] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const loader =
    resource.type === "request"
      ? ActionLoaders.sharedVerificationLinks.createForRequest(resource.globalId)
      : ActionLoaders.sharedVerificationLinks.createForTask(resource.globalId);
  const createAction = useAsyncAction(loader);

  const create = async () => {
    if (hasSharedVerificationLink) {
      return;
    }

    await createAction.run(async () => {
      const linkGlobalId =
        resource.type === "request"
          ? await createSharedVerificationLinkForRequest(tenantGlobalId, resource.globalId)
          : await createSharedVerificationLinkForTask(tenantGlobalId, resource.globalId);
      if (!linkGlobalId) {
        return;
      }

      try {
        await navigator.clipboard.writeText(`${window.location.origin}/app/verification/${linkGlobalId}`);
      } catch {
        notification.warning("The verification link was created, but could not be copied to the clipboard.");
      }
      showPersistenceSuccessNotification(PersistenceSuccessMessages.sharedVerificationLinkCreated);
      setRefreshKey((current) => current + 1);
    });
  };

  return (
    <>
      <SharedVerificationLinksPanel
        approvalRequestGlobalId={resource.type === "request" ? resource.globalId : undefined}
        approvalRequestTaskGlobalId={resource.type === "task" ? resource.globalId : undefined}
        onHasLinkChange={setHasSharedVerificationLink}
        refreshKey={refreshKey}
        tenantGlobalId={tenantGlobalId}
      />
      <ApprovalRequestActionBar onClose={onClose}>
        <LoadingButton
          disabled={hasSharedVerificationLink || createAction.isRunning}
          loading={createAction.isRunning}
          startIcon={<LinkOutlined />}
          variant="outlined"
          onClick={create}
        >
          Create link
        </LoadingButton>
      </ApprovalRequestActionBar>
    </>
  );
};

export default ApprovalRequestSharedVerificationLinksSection;
