import { StackSpacing } from "@/shared/theme/tokens";
import { Stack, Typography } from "@mui/material";
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

const sectionTitleSx: SxProps<Theme> = {
  fontSize: "1.05rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const CertificateSection: React.FC<CertificateSectionProps> = ({ children, title }) => (
  <Stack spacing={StackSpacing.default} sx={sectionSx}>
    <Typography variant="h2" sx={sectionTitleSx}>
      {title}
    </Typography>
    {children}
  </Stack>
);

export default CertificateSection;
