import {
  ApprovalRequestDetailsCardMode,
  ApprovalRequestDetailsCardModeContext,
} from "@/features/approvalRequests/components/ApprovalRequestDetailsCardContext";
import AppCard from "@/shared/components/papers/AppCard";
import AppCardContent from "@/shared/components/papers/AppCardContent";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";

interface ApprovalRequestDetailsCardProps {
  ariaLabel: string;
  borderLeftColor?: string;
  borderLeftStyle?: "dotted" | "solid";
  children: ReactNode;
  contentSx?: SxProps<Theme>;
  elevated?: boolean;
  mode?: ApprovalRequestDetailsCardMode;
  onClick?: () => void;
  showStatusBorder?: boolean;
  sx?: SxProps<Theme>;
}

const clickableCardSx: SxProps<Theme> = {
  cursor: "pointer",
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "success.main",
    outlineOffset: 2,
  },
};

const ApprovalRequestDetailsCard: React.FC<ApprovalRequestDetailsCardProps> = ({
  ariaLabel,
  borderLeftColor = "divider",
  borderLeftStyle = "solid",
  children,
  contentSx,
  elevated = false,
  mode = "display",
  onClick,
  showStatusBorder = true,
  sx,
}) => {
  const isClickable = Boolean(onClick);
  const statusBorderSx: SxProps<Theme> = {
    borderLeft: `3px ${borderLeftStyle}`,
    borderLeftColor,
  };
  const cardSx: SxProps<Theme> = [
    ...(isClickable ? [clickableCardSx as SystemStyleObject<Theme>] : []),
    ...(showStatusBorder ? [statusBorderSx] : []),
    ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
  ];

  return (
    <ApprovalRequestDetailsCardModeContext.Provider value={mode}>
      <AppCard
        elevated={elevated}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={
          isClickable
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        role={isClickable ? "button" : undefined}
        sx={cardSx}
        tabIndex={isClickable ? 0 : undefined}
      >
        <AppCardContent sx={contentSx}>{children}</AppCardContent>
      </AppCard>
    </ApprovalRequestDetailsCardModeContext.Provider>
  );
};

export default ApprovalRequestDetailsCard;
