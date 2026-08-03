import {
  deleteSharedVerificationLinkForRequest,
  deleteSharedVerificationLinkForTask,
  listSharedVerificationLinksForRequest,
  listSharedVerificationLinksForTask,
} from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import { SharedVerificationLinkListItem } from "@/features/sharedVerificationLinks/models/sharedVerificationLink";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { PersistenceSuccessMessages, showPersistenceSuccessToast } from "@/shared/utils/toasts";
import { ContentCopyOutlined, DeleteOutline } from "@mui/icons-material";
import {
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface SharedVerificationLinksPanelProps {
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  onHasLinkChange?: (hasLink: boolean) => void;
  refreshKey?: number;
  tenantGlobalId?: string | null;
}

const getVerificationUrl = (globalId: string): string =>
  `${window.location.origin}/app/verification/${globalId}`;

const SharedVerificationLinksPanel: React.FC<SharedVerificationLinksPanelProps> = ({
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  onHasLinkChange,
  refreshKey,
  tenantGlobalId,
}) => {
  const [links, setLinks] = useState<SharedVerificationLinkListItem[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const loadLinks = useCallback(async () => {
    if (!tenantGlobalId) {
      setLinks([]);
      return;
    }

    const loadedLinks = approvalRequestGlobalId
      ? await listSharedVerificationLinksForRequest(tenantGlobalId, approvalRequestGlobalId)
      : approvalRequestTaskGlobalId
        ? await listSharedVerificationLinksForTask(tenantGlobalId, approvalRequestTaskGlobalId)
        : [];
    setLinks(loadedLinks);
    onHasLinkChange?.(loadedLinks.length > 0);
  }, [approvalRequestGlobalId, approvalRequestTaskGlobalId, onHasLinkChange, tenantGlobalId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks, refreshKey]);

  const handleCopy = async (globalId: string) => {
    await navigator.clipboard?.writeText(getVerificationUrl(globalId));
    showPersistenceSuccessToast(PersistenceSuccessMessages.sharedVerificationLinkCopied);
  };

  const handleDelete = async (linkGlobalId: string) => {
    if (!tenantGlobalId) {
      return;
    }

    setIsBusy(true);
    const deleted = approvalRequestGlobalId
      ? await deleteSharedVerificationLinkForRequest(tenantGlobalId, approvalRequestGlobalId, linkGlobalId)
      : approvalRequestTaskGlobalId
        ? await deleteSharedVerificationLinkForTask(tenantGlobalId, approvalRequestTaskGlobalId, linkGlobalId)
        : false;
    if (deleted) {
      showPersistenceSuccessToast(PersistenceSuccessMessages.sharedVerificationLinkDeleted);
      await loadLinks();
    }
    setIsBusy(false);
  };

  return (
    <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
      {links.length === 0 ? (
        <Typography color="text.secondary">No verification link.</Typography>
      ) : (
        <List disablePadding>
          {links.map((link) => {
            const verificationUrl = getVerificationUrl(link.globalId);
            return (
              <ListItem
                key={link.globalId}
                disableGutters
                secondaryAction={
                  <Stack direction="row" spacing={StackSpacing.tight}>
                    <Tooltip title="Copy link">
                      <IconButton edge="end" onClick={() => handleCopy(link.globalId)}>
                        <ContentCopyOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete link">
                      <IconButton edge="end" disabled={isBusy} onClick={() => handleDelete(link.globalId)}>
                        <DeleteOutline />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={StackSpacing.default} alignItems="center">
                      <Link href={verificationUrl} target="_blank" rel="noreferrer">
                        {link.globalId}
                      </Link>
                    </Stack>
                  }
                  secondary={`Created at ${getLocaleDateTimeString(link.createdAt)}`}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Stack>
  );
};

export default SharedVerificationLinksPanel;
