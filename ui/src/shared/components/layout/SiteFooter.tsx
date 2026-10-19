import { Box, Link, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

const footerSx: SxProps<Theme> = {
  borderTop: 1,
  borderColor: "divider",
  color: "text.secondary",
};
const innerSx: SxProps<Theme> = {
  alignItems: "center",
  boxSizing: "border-box",
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "space-between",
  margin: "auto",
  maxWidth: 1240,
  px: "32px",
  py: "24px",
  "@media (max-width: 700px)": { px: "20px" },
};
const copyrightSx: SxProps<Theme> = { fontSize: "11px", fontWeight: 500 };
const navigationSx: SxProps<Theme> = { display: "flex", flexWrap: "wrap", gap: "16px" };
const linkSx: SxProps<Theme> = {
  fontSize: "11px",
  "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "4px" },
};
const links = [
  { label: "Home", href: "/" },
  { label: "App", href: "/app/" },
  { label: "Docs", href: "/docs/" },
  { label: "Contact", href: "/contact/" },
  { label: "Terms", href: "/terms/" },
  { label: "Privacy", href: "/privacy/" },
] as const;

const SiteFooter = () => (
  <Box component="footer" sx={footerSx}>
    <Box sx={innerSx}>
      <Typography component="p" sx={copyrightSx}>
        © {new Date().getFullYear()} Click2Approve. All rights reserved.
      </Typography>
      <Box component="nav" aria-label="Footer navigation" sx={navigationSx}>
        {links.map(({ label, href }) => (
          <Link key={href} href={href} color="inherit" underline="hover" sx={linkSx}>
            {label}
          </Link>
        ))}
      </Box>
    </Box>
  </Box>
);

export default SiteFooter;
