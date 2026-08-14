import { Card, CardContent } from "@mui/material";
import type { SxProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";

interface ApprovalRequestDetailsCardProps {
  ariaLabel: string;
  borderLeftColor?: string;
  borderLeftStyle?: "dotted" | "solid";
  children: ReactNode;
  contentSx?: SxProps<Theme>;
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

const detailsCardSx: SxProps<Theme> = {
  alignSelf: "stretch",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: (theme) => `0 2px 4px ${alpha(theme.palette.common.black, 0.08)}`,
  p: 0,
};

const detailsCardContentSx: SxProps<Theme> = {
  p: 2,
  "&:last-child": {
    pb: 2,
  },
};

const ApprovalRequestDetailsCard: React.FC<ApprovalRequestDetailsCardProps> = ({
  ariaLabel,
  borderLeftColor = "divider",
  borderLeftStyle = "solid",
  children,
  contentSx,
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
    detailsCardSx as SystemStyleObject<Theme>,
    ...(isClickable ? [clickableCardSx as SystemStyleObject<Theme>] : []),
    ...(showStatusBorder ? [statusBorderSx] : []),
    ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
  ];
  const cardContentSx: SxProps<Theme> = [
    detailsCardContentSx as SystemStyleObject<Theme>,
    ...(contentSx ? (Array.isArray(contentSx) ? contentSx : [contentSx]) : []),
  ];

  return (
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
  );
};

export default ApprovalRequestDetailsCard;
