import { Forms } from "@/shared/components/dialogs/formStyles";
import AppCard from "@/shared/components/papers/AppCard";
import CardHeading from "@/shared/components/papers/CardHeading";
import { CardContent, Stack } from "@mui/material";
import { useId, type ReactNode } from "react";

interface FormCardProps {
  children: ReactNode;
  title: string;
}

const FormCard: React.FC<FormCardProps> = ({ children, title }) => {
  const titleId = useId();
  return (
    <AppCard component="section" aria-labelledby={titleId}>
      <CardContent>
        <Stack spacing={Forms.formStackSpacing}>
          <CardHeading id={titleId} variant="cardTitle">
            {title}
          </CardHeading>
          {children}
        </Stack>
      </CardContent>
    </AppCard>
  );
};

export default FormCard;
