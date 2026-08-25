import { stores } from "@/app/rootStore";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { createReceiptLink, deleteReceiptLink, getReceipt } from "@/features/receipts/api/receiptsApi";
import ReceiptCard from "@/features/receipts/components/ReceiptCard";
import type { Receipt } from "@/features/receipts/models/receipt";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
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
    navigate(receiptsPath, { state: { currentReceiptGlobalId: receipt.globalId } });
  };
  return (
    <NarrowContent>
      <CloseOnEscape onClose={handleClose}>
        <PageBreadcrumbs
          items={[
            { label: "Receipts", state: { currentReceiptGlobalId: receipt.globalId }, to: receiptsPath },
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
          <Stack sx={Dialogs.tabContentSx}>
            <ReceiptCard receipt={receipt} />
            <ApprovalRequestActionBar onClose={handleClose} />
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
      </CloseOnEscape>
    </NarrowContent>
  );
};

export default ReceiptPage;
