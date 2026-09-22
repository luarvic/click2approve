import { stores } from "@/app/rootStore";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { deleteReceipt, getReceipt } from "@/features/receipts/api/receiptsApi";
import ReceiptLinksGrid from "@/features/receipts/components/ReceiptLinksGrid";
import ReceiptView from "@/features/receipts/components/ReceiptView";
import type { Receipt } from "@/features/receipts/models/receipt";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Forms } from "@/shared/components/dialogs/formStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { Routes } from "@/shared/routing/routes";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { Button, Stack, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
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
  useEffect(() => {
    let active = true;
    setReceipt(undefined);
    if (tenantGlobalId && receiptGlobalId) {
      void getReceipt(tenantGlobalId, receiptGlobalId).then((value) => {
        if (active) setReceipt(value);
      });
    }
    return () => {
      active = false;
    };
  }, [receiptGlobalId, tenantGlobalId]);

  if (receipt === null) return <NotFoundPage />;
  if (!receipt || !receiptGlobalId) return null;
  if (tab === "share" && !receipt.canManageLinks) return <NotFoundPage />;

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
            {
              label: receipt.approvalRequestTitle,
              titleAction: (
                <HelpPopover helpText="Manage verification links for your own receipts in Personal. In organizations, only owners and admins can manage links." />
              ),
            },
          ]}
        />
        <Tabs
          value={tab}
          onChange={(_, value: ReceiptPageProps["tab"]) =>
            navigate(`${receiptsPath}/${receiptGlobalId}${value === "request" ? "" : "/share"}`)
          }
        >
          <Tab label="Receipt" value="request" />
          {receipt.canManageLinks && <Tab label="Share" value="share" />}
        </Tabs>
        {tab === "request" && (
          <Stack sx={Forms.tabContentSx}>
            <ReceiptView receipt={receipt} />
            <ApprovalRequestActionBar onClose={handleClose}>
              {receipt.canDelete && (
                <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
                  Delete
                </Button>
              )}
            </ApprovalRequestActionBar>
          </Stack>
        )}
        {tab === "share" && (
          <Stack sx={Forms.tabContentSx}>
            <ReceiptLinksGrid
              key={`${tenantGlobalId}:${receiptGlobalId}`}
              tenantGlobalId={tenantGlobalId!}
              receiptGlobalId={receiptGlobalId}
            />
            <ApprovalRequestActionBar onClose={handleClose} />
          </Stack>
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
