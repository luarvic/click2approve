import { ApprovalRequestFieldValueVariantContext } from "@/features/approvalRequests/components/ApprovalRequestFieldContext";
import CardHeading from "@/shared/components/papers/CardHeading";
import type { TypographyProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestFieldGroupProps {
  children: ReactNode;
  title: string;
  valueVariant?: TypographyProps["variant"];
}

const fieldGroupTitleSx: SxProps<Theme> = {
  mb: 2,
};

const ApprovalRequestFieldGroup: React.FC<ApprovalRequestFieldGroupProps> = ({ children, title, valueVariant }) => (
  <ApprovalRequestFieldValueVariantContext.Provider value={valueVariant ?? "body1"}>
    <Stack component="section">
      <CardHeading component="h3" sx={fieldGroupTitleSx}>
        {title}
      </CardHeading>
      {children}
    </Stack>
  </ApprovalRequestFieldValueVariantContext.Provider>
);

export default ApprovalRequestFieldGroup;
