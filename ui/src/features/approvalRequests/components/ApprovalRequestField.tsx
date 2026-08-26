import ApprovalRequestDetailLabel from "@/features/approvalRequests/components/ApprovalRequestDetailLabel";
import { ApprovalRequestFieldValueVariantContext } from "@/features/approvalRequests/components/ApprovalRequestFieldContext";
import { Stack, Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { StackSpacing } from "@/shared/constants/constants";
import { useContext, type ReactNode } from "react";

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
  valueVariant,
}) => {
  const defaultValueVariant = useContext(ApprovalRequestFieldValueVariantContext);
  const resolvedValueVariant = valueVariant ?? defaultValueVariant;
  const isEmpty = value === undefined || value === null || value === "";

  return (
    <Stack spacing={StackSpacing.tight}>
      <ApprovalRequestDetailLabel>{label}</ApprovalRequestDetailLabel>
      {isEmpty ? (
        <Typography color="text.secondary" variant={resolvedValueVariant}>
          None
        </Typography>
      ) : typeof value === "string" || typeof value === "number" ? (
        <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
          <Stack sx={valueIconSx}>{valueIcon}</Stack>
          <Typography color={valueColor} variant={resolvedValueVariant}>
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
