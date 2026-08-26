import { ExpandMore } from "@mui/icons-material";
import { ApprovalRequestFieldValueVariantContext } from "@/features/approvalRequests/components/ApprovalRequestFieldContext";
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import type { TypographyProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { StackSpacing } from "@/shared/constants/constants";
import type { ReactNode } from "react";

interface ApprovalRequestFieldGroupProps {
  children: ReactNode;
  title: string;
  valueVariant?: TypographyProps["variant"];
}

const fieldGroupSx: SxProps<Theme> = {
  backgroundColor: "transparent",
  backgroundImage: "none",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  overflow: "hidden",
  "&::before": {
    display: "none",
  },
};

const ApprovalRequestFieldGroup: React.FC<ApprovalRequestFieldGroupProps> = ({ children, title, valueVariant }) => (
  <ApprovalRequestFieldValueVariantContext.Provider value={valueVariant ?? "body1"}>
    <Accordion defaultExpanded disableGutters sx={fieldGroupSx}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={StackSpacing.default}>{children}</Stack>
      </AccordionDetails>
    </Accordion>
  </ApprovalRequestFieldValueVariantContext.Provider>
);

export default ApprovalRequestFieldGroup;
