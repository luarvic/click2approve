import { ApprovalRequestFieldValueVariantContext } from "@/features/approvalRequests/components/ApprovalRequestFieldContext";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import type { TypographyProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useContext, type ReactNode } from "react";

interface ApprovalRequestFieldProps {
  labelId?: string;
  label: string;
  valueColor?: TypographyProps["color"];
  valueIcon?: ReactNode;
  valueIconSx?: SxProps<Theme>;
  valueVariant?: TypographyProps["variant"];
  value?: ReactNode;
}

const ApprovalRequestField: React.FC<ApprovalRequestFieldProps> = ({
  labelId,
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
      <Typography id={labelId} variant="caption" color="text.secondary">
        {label}
      </Typography>
      {isEmpty ? (
        <Typography variant={resolvedValueVariant} color="text.secondary">
          None
        </Typography>
      ) : typeof value === "string" || typeof value === "number" ? (
        <Stack direction="row" spacing={StackSpacing.tight} sx={Flex.alignCenterSx}>
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
