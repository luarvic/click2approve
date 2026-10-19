import { Typography, TypographyProps, type SxProps, type Theme } from "@mui/material";
import type { ElementType } from "react";

interface ApprovalRequestNumberTextProps {
  color?: TypographyProps["color"];
  component?: ElementType;
  globalId?: string;
  includeHash?: boolean;
  prefix?: string;
  variant?: TypographyProps["variant"];
}

export const getApprovalRequestNumber = (globalId?: string, includeHash: boolean = true): string => {
  if (!globalId) {
    return "";
  }

  return `${includeHash ? "#" : ""}${globalId.slice(0, 5)}`;
};

const numberColorSx = (color: TypographyProps["color"]): SxProps<Theme> => ({ color });

const ApprovalRequestNumberText: React.FC<ApprovalRequestNumberTextProps> = ({
  color = "text.secondary",
  component = "span",
  globalId,
  includeHash = true,
  prefix,
  variant = "body2",
}) => {
  const number = getApprovalRequestNumber(globalId, includeHash);
  if (!number) {
    return null;
  }

  return (
    <Typography sx={numberColorSx(color)} component={component} variant={variant}>
      {prefix ? `${prefix} ${number}` : number}
    </Typography>
  );
};

export default ApprovalRequestNumberText;
