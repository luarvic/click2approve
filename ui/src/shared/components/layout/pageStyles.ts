import type { SxProps, Theme } from "@mui/material";
export const Pages = {
  containerSx: { px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 } } satisfies SxProps<Theme>,
  wrapperSx: { display: "flex", flexDirection: "column", flex: 1 } satisfies SxProps<Theme>,
  centeredStateSx: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    "&::before": { content: "''", flexGrow: 4 },
    "&::after": { content: "''", flexGrow: 5 },
  } satisfies SxProps<Theme>,
  titleSx: { mb: 3 } satisfies SxProps<Theme>,
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
  centeredMessageMaxWidth: "xs",
  backdropLoadingSx: {
    color: "#fff",
    zIndex: (theme) => theme.zIndex.modal + 1,
  } as SxProps<Theme>,
} as const;
