import { Icons } from "@/shared/components/icons/iconStyles";
import {
  BlockOutlined,
  CancelOutlined,
  Done,
  DoNotDisturbOnOutlined,
  HourglassTop,
  ReplayOutlined,
  TimerOutlined,
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material/SvgIcon";

export type ApprovalRequestTimestampType =
  | "canceled"
  | "completed"
  | "completedSuccessfully"
  | "completedUnsuccessfully"
  | "created"
  | "pending"
  | "skipped"
  | "superseded";

export const getApprovalRequestTimestampIcon = (
  type: ApprovalRequestTimestampType,
  pendingColor: SvgIconProps["color"] = Icons.secondaryColor,
) => {
  switch (type) {
    case "created":
      return <TimerOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "pending":
      return <HourglassTop color={pendingColor} fontSize="inherit" />;
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
      return <Done color="success" fontSize="inherit" />;
  }
};
