import ApprovalRequestDetailLabel from "@/features/approvalRequests/components/ApprovalRequestDetailLabel";
import { Stack, Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { StackSpacing } from "@/shared/constants/constants";
import type { ReactNode } from "react";

interface ApprovalRequestFieldProps {
  label: string;
  valueColor?: TypographyProps["color"];
  valueIcon?: ReactNode;
  valueIconSx?: SxProps<Theme>;
  valueVariant?: TypographyProps["variant"];
  value?: ReactNode;
}

const ApprovalRequestField: React.FC<ApprovalRequestFieldProps> = ({
  label,
  value,
  valueColor,
  valueIcon,
  valueIconSx,
  valueVariant = "body2",
}) => {
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <Stack spacing={StackSpacing.tight}>
      <ApprovalRequestDetailLabel>{label}</ApprovalRequestDetailLabel>
      {isEmpty ? (
        <Typography color="text.secondary" variant={valueVariant}>
          None
        </Typography>
      ) : typeof value === "string" || typeof value === "number" ? (
        <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
          <Stack sx={valueIconSx}>{valueIcon}</Stack>
          <Typography color={valueColor} variant={valueVariant}>
            {value}
          </Typography>
        </Stack>
      ) : (
        value
      )}
    </Stack>
  );
};

export default ApprovalRequestField;
