import CardHeading from "@/shared/components/papers/CardHeading";
import { StackSpacing } from "@/shared/theme/tokens";
import { Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface CertificateSectionProps {
  children: ReactNode;
  title: string;
}

const sectionSx: SxProps<Theme> = {
  breakInside: "avoid",
  containerType: "inline-size",
};

const CertificateSection: React.FC<CertificateSectionProps> = ({ children, title }) => (
  <Stack spacing={StackSpacing.default} sx={sectionSx}>
    <CardHeading>{title}</CardHeading>
    {children}
  </Stack>
);

export default CertificateSection;
