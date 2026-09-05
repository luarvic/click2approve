import type { SxProps, Theme } from "@mui/material";
export const ApprovalGrids = {
  approvalNumberColumnWidth: 72,
  approvalNumberColumnMinDisplayWidth: 600,
  approvalRevisionColumnWidth: 96,
  mobileTaskRowHeightEstimate: 116,
  mobileTaskTitleSpacing: 0.5,
  approvalColumnFlex: {
    content: 5,
    metadata: 3,
  },
  tasksColumnSizing: {
    requestedBy: { flex: 4 },
    status: { flex: 2 },
  },
  titleLinkSx: { overflowWrap: "anywhere", whiteSpace: "normal" } as SxProps<Theme>,
  mobileTaskTitleLinkSx: {
    minWidth: 0,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  } as SxProps<Theme>,
  mobileTaskTitleRowSx: { alignItems: "center", minWidth: 0, width: "100%" } as SxProps<Theme>,
  mobileMetadataSx: { overflowWrap: "anywhere", whiteSpace: "normal" } as SxProps<Theme>,
  approvalTitleCellSx: {
    py: { xs: 1.5, md: 0 },
    gap: { xs: 0.5, md: 0 },
    whiteSpace: "normal",
    height: "100%",
    justifyContent: "center",
    minWidth: 0,
  } as SxProps<Theme>,
} as const;
