import { Typography, TypographyProps } from "@mui/material";

interface ApprovalRequestNumberTextProps {
  color?: TypographyProps["color"];
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

const ApprovalRequestNumberText: React.FC<ApprovalRequestNumberTextProps> = ({
  color = "text.secondary",
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
    <Typography color={color} component="span" variant={variant}>
      {prefix ? `${prefix} ${number}` : number}
    </Typography>
  );
};

export default ApprovalRequestNumberText;
