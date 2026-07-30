import { Typography, TypographyProps } from "@mui/material";

interface ApprovalRequestNumberTextProps {
  globalId?: string;
  includeHash?: boolean;
  variant?: TypographyProps["variant"];
}

export const getApprovalRequestNumber = (
  globalId?: string,
  includeHash: boolean = true,
): string => {
  if (!globalId) {
    return "";
  }

  return `${includeHash ? "#" : ""}${globalId.slice(0, 5)}`;
};

const ApprovalRequestNumberText: React.FC<ApprovalRequestNumberTextProps> = ({
  globalId,
  includeHash = true,
  variant = "body2",
}) => {
  const number = getApprovalRequestNumber(globalId, includeHash);
  if (!number) {
    return null;
  }

  return (
    <Typography
      color="text.secondary"
      component="span"
      variant={variant}
    >
      {number}
    </Typography>
  );
};

export default ApprovalRequestNumberText;
