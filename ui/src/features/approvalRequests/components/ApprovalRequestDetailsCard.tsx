import {
  ApprovalRequestDetailsCardMode,
  ApprovalRequestDetailsCardModeContext,
} from "@/features/approvalRequests/components/ApprovalRequestDetailsCardContext";
import {
  elevatedStandardCardSx,
  standardCardContentSx,
  standardCardSx,
} from "@/shared/components/papers/StandardCardStyles";
import type { SxProps } from "@mui/material";
import { Card, CardContent } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
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
    borderRadius: 1,
    outline: "2px solid",
    outlineColor: "success.main",
    outlineOffset: 2,
  },
};

export const taskCardBackgroundSx: SxProps<Theme> = {
  backgroundColor: (theme) => alpha(theme.palette.grey[500], theme.palette.mode === "dark" ? 0.08 : 0.04),
};

export const requestCardBackgroundSx: SxProps<Theme> = {
  backgroundColor: (theme) => alpha(theme.palette.grey[500], theme.palette.mode === "dark" ? 0.08 : 0.04),
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
    standardCardSx as SystemStyleObject<Theme>,
    ...(elevated ? [elevatedStandardCardSx as SystemStyleObject<Theme>] : []),
    ...(isClickable ? [clickableCardSx as SystemStyleObject<Theme>] : []),
    ...(showStatusBorder ? [statusBorderSx] : []),
    ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
  ];
  const cardContentSx: SxProps<Theme> = [
    standardCardContentSx as SystemStyleObject<Theme>,
    ...(contentSx ? (Array.isArray(contentSx) ? contentSx : [contentSx]) : []),
  ];

  return (
    <ApprovalRequestDetailsCardModeContext.Provider value={mode}>
      <Card
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
        <CardContent sx={cardContentSx}>{children}</CardContent>
      </Card>
    </ApprovalRequestDetailsCardModeContext.Provider>
  );
};

export default ApprovalRequestDetailsCard;
