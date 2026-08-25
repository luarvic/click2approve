import { Dialogs } from "@/shared/constants/constants";
import { Button, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalRequestActionBarProps {
  children?: ReactNode;
  closeLabel?: string;
  onClose: () => void;
}

const ApprovalRequestActionBar: React.FC<ApprovalRequestActionBarProps> = ({
  children,
  closeLabel = "Cancel",
  onClose,
}) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.actionBarSx}>
    <Button variant="outlined" onClick={onClose}>
      {closeLabel}
    </Button>
    {children}
  </Stack>
);

export default ApprovalRequestActionBar;
