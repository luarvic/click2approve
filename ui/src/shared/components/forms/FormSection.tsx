import { Forms } from "@/shared/components/dialogs/formStyles";
import CardHeading from "@/shared/components/papers/CardHeading";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface FormSectionProps {
  children: ReactNode;
  title: string;
  titleId?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ children, title, titleId }) => (
  <Stack component="section" spacing={Forms.formStackSpacing}>
    <CardHeading component="h3" id={titleId}>
      {title}
    </CardHeading>
    {children}
  </Stack>
);

export default FormSection;
