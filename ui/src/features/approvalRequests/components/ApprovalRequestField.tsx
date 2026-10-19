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

const fieldRowSx: SxProps<Theme> = {
  borderTop: 1,
  borderColor: "divider",
  display: "grid",
  gridTemplateColumns: "minmax(90px, 1fr) minmax(0, 2fr)",
  alignItems: "start",
  columnGap: 2,
  rowGap: 0.75,
  py: 1.5,
  "& > *": { minWidth: 0, overflowWrap: "anywhere" },
};
const fieldLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: 400,
  lineHeight: 1.7,
};
const fieldValueSx: SxProps<Theme> = {
  color: "text.primary",
  minWidth: 0,
  fontWeight: 400,
};

const valueColorSx = (color: TypographyProps["color"]): SxProps<Theme> => ({ color });

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
  const isEmpty =
    value === undefined || value === null || value === false || (typeof value === "string" && !value.trim());

  if (isEmpty) return null;

  return (
    <Stack className="approval-request-field" sx={fieldRowSx}>
      <Typography id={labelId} variant={resolvedValueVariant} color="textSecondary" sx={fieldLabelSx}>
        {label}
      </Typography>
      <Stack sx={fieldValueSx}>
        {typeof value === "string" || typeof value === "number" ? (
          <Stack direction="row" spacing={StackSpacing.tight} sx={Flex.alignCenterSx}>
            <Stack sx={valueIconSx}>{valueIcon}</Stack>
            <Typography sx={valueColorSx(valueColor)} variant={resolvedValueVariant}>
              {value}
            </Typography>
          </Stack>
        ) : (
          value
        )}
      </Stack>
    </Stack>
  );
};

export default ApprovalRequestField;
