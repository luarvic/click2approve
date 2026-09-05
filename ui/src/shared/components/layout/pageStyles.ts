import type { SxProps, Theme } from "@mui/material";
export const Pages = {
  containerSx: { p: 2 } as SxProps<Theme>,
  titleSx: { mb: 2 } as SxProps<Theme>,
  breadcrumbCurrentSx: {
    color: "text.primary",
    fontWeight: 600,
  } as SxProps<Theme>,
  breadcrumbLinkSx: {
    color: "text.secondary",
    textDecoration: "none",
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
  centeredMessageMaxWidth: "xs",
  backdropLoadingSx: {
    color: "#fff",
    zIndex: (theme) => theme.zIndex.modal + 1,
  } as SxProps<Theme>,
} as const;
