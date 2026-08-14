import SuccessSnackbarIcon from "@/shared/components/icons/SuccessSnackbarIcon";
import { Icons } from "@/shared/constants/constants";
import {
  BlockOutlined,
  CancelOutlined,
  DoNotDisturbOnOutlined,
  PendingOutlined,
  ReplayOutlined,
  TimerOutlined,
} from "@mui/icons-material";

export type ApprovalRequestTimestampType =
  | "canceled"
  | "completed"
  | "completedSuccessfully"
  | "completedUnsuccessfully"
  | "created"
  | "pending"
  | "skipped"
  | "superseded";

export const getApprovalRequestTimestampIcon = (type: ApprovalRequestTimestampType) => {
  switch (type) {
    case "created":
      return <TimerOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "pending":
      return <PendingOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "completedUnsuccessfully":
      return <CancelOutlined color="error" fontSize="inherit" />;
    case "canceled":
      return <BlockOutlined color="warning" fontSize="inherit" />;
    case "skipped":
      return <DoNotDisturbOnOutlined color="warning" fontSize="inherit" />;
    case "superseded":
      return <ReplayOutlined color="warning" fontSize="inherit" />;
    case "completedSuccessfully":
    case "completed":
      return <SuccessSnackbarIcon color="success" fontSize="inherit" />;
  }
};
