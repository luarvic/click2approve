import type { SxProps, Theme } from "@mui/material";
import { Typography } from "@mui/material";
import type { ReactNode } from "react";

export type CardHeadingVariant = "cardTitle" | "sectionLabel";

interface CardHeadingProps {
  children: ReactNode;
  component?: "h2" | "h3" | "span";
  id?: string;
  sx?: SxProps<Theme>;
  variant?: CardHeadingVariant;
}

const cardHeadingSx = { color: "text.secondary" } as const;

const CardHeading: React.FC<CardHeadingProps> = ({ children, component = "h2", id, sx, variant = "sectionLabel" }) => (
  <Typography component={component} id={id} variant={variant} sx={[cardHeadingSx, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Typography>
);

export default CardHeading;
