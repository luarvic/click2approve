import { stores } from "@/app/rootStore";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { createReceiptLink, deleteReceipt, deleteReceiptLink, getReceipt } from "@/features/receipts/api/receiptsApi";
import ReceiptView from "@/features/receipts/components/ReceiptView";
import type { Receipt } from "@/features/receipts/models/receipt";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Forms } from "@/shared/components/dialogs/formStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { Routes } from "@/shared/routing/routes";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { Button, Link, List, ListItem, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ReceiptPageProps {
  tab?: "request" | "share";
}

const ReceiptPage: React.FC<ReceiptPageProps> = ({ tab = "request" }) => {
  const navigate = useNavigate();
  const { receiptGlobalId } = useParams<{ receiptGlobalId: string }>();
  usePageTitle(`Receipt ${getApprovalRequestNumber(receiptGlobalId)}`);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const [receipt, setReceipt] = useState<Receipt | null | undefined>(undefined);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const receiptsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/receipts") : "/";
  const reload = useCallback(() => {
    if (tenantGlobalId && receiptGlobalId) void getReceipt(tenantGlobalId, receiptGlobalId).then(setReceipt);
  }, [receiptGlobalId, tenantGlobalId]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (receipt === null) return <NotFoundPage />;
  if (!receipt || !receiptGlobalId) return null;

  const handleClose = () => {
    navigate(receiptsPath, {
      state: { currentReceiptGlobalId: receipt.globalId },
    });
  };
  const handleDelete = async () => {
    if (!tenantGlobalId || !receiptGlobalId) {
      return false;
    }

    const deleted = await deleteReceipt(tenantGlobalId, receiptGlobalId);
    if (deleted) {
      showPersistenceSuccessNotification(PersistenceSuccessMessages.receiptDeleted);
      navigate(receiptsPath);
    }
    return deleted;
  };
  return (
    <NarrowContent>
      <CloseOnEscape onClose={handleClose}>
        <PageBreadcrumbs
          items={[
            {
              label: "Receipts",
              state: { currentReceiptGlobalId: receipt.globalId },
              to: receiptsPath,
            },
            { label: receipt.approvalRequestTitle },
          ]}
        />
        <Tabs
          value={tab}
          onChange={(_, value: ReceiptPageProps["tab"]) =>
            navigate(`${receiptsPath}/${receiptGlobalId}${value === "request" ? "" : "/share"}`)
          }
        >
          <Tab label="Receipt" value="request" />
          <Tab label="Share" value="share" />
        </Tabs>
        {tab === "request" && (
          <Stack sx={Forms.tabContentSx}>
            <ReceiptView receipt={receipt} />
            <ApprovalRequestActionBar onClose={handleClose}>
              <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
                Delete
              </Button>
            </ApprovalRequestActionBar>
          </Stack>
        )}
        {tab === "share" && (
          <>
            <Button
              onClick={() => {
                if (tenantGlobalId && receiptGlobalId) {
                  void createReceiptLink(tenantGlobalId, receiptGlobalId).then(reload);
                }
              }}
            >
              Create link
            </Button>
            <List>
              {receipt.links.map((link) => (
                <ListItem
                  key={link.globalId}
                  secondaryAction={
                    <Button
                      onClick={() => {
                        if (tenantGlobalId && receiptGlobalId) {
                          void deleteReceiptLink(tenantGlobalId, receiptGlobalId, link.globalId).then(reload);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  }
                >
                  <Link
                    href={`${window.location.origin}/app/receipt-verification/${link.globalId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.globalId}
                  </Link>
                </ListItem>
              ))}
              {receipt.links.length === 0 && <Typography color="text.secondary">No receipt links.</Typography>}
            </List>
            <ApprovalRequestActionBar onClose={handleClose} />
          </>
        )}
        <DeleteConfirmationDialog
          entityName={receipt.approvalRequestTitle}
          open={deleteDialogIsOpen}
          title="Delete receipt"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={handleDelete}
        />
      </CloseOnEscape>
    </NarrowContent>
  );
};

export default ReceiptPage;
