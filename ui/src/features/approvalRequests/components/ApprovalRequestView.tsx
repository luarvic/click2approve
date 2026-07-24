import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import { Dialogs, Pages } from "@/shared/constants/constants";
import {
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface ApprovalRequestViewProps {
  onClose: (currentApprovalRequestId?: number) => void;
}

const ApprovalRequestView: React.FC<ApprovalRequestViewProps> = ({
  onClose,
}) => {
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const [selectedTab, setSelectedTab] = useState("request");

  useEffect(() => {
    setSelectedTab("request");
  }, [approvalRequest]);

  const handleClose = () => {
    onClose(approvalRequest?.id);
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Approval request
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_, value: string) => setSelectedTab(value)}
        aria-label="Approval request sections"
      >
        <Tab label="Request" value="request" />
        <Tab label="Log" value="log" />
      </Tabs>
      {selectedTab === "request" && <ApprovalRequestDetails approvalRequest={approvalRequest} />}
      {selectedTab === "log" && (
        <ApprovalRequestLog approvalRequest={approvalRequest} />
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestView);
