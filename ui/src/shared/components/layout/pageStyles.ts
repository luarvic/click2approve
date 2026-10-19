import type { SxProps, Theme } from "@mui/material";
export const Pages = {
  containerSx: { px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 } } as SxProps<Theme>,
  titleSx: { mb: 1 } as SxProps<Theme>,
  breadcrumbCurrentSx: {
    color: "text.primary",
    fontWeight: 500,
    alignItems: "center",
    display: "flex",
    gap: 0.5,
    minWidth: 0,
  } as SxProps<Theme>,
  breadcrumbLinkSx: {
    color: "primary.main",
    fontWeight: 600,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    "&:hover": {
      color: "text.primary",
      textDecoration: "underline",
    },
  } as SxProps<Theme>,
  centeredMessageContainerSx: {
    mt: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  } as SxProps<Theme>,
  centeredMessageLogoSx: { display: "block", height: 72, width: 72 } as const,
  centeredMessageLogoLinkSx: { display: "block", mb: 2 } as const,
  centeredMessageMaxWidth: "xs",
  backdropLoadingSx: {
    color: "#fff",
    zIndex: (theme) => theme.zIndex.modal + 1,
  } as SxProps<Theme>,
} as const;
