import type { SxProps, Theme } from "@mui/material";
export const ApprovalGrids = {
  approvalNumberColumnWidth: 72,
  approvalNumberColumnMinDisplayWidth: 600,
  approvalRevisionColumnWidth: 96,
  approvalColumnFlex: {
    content: 5,
    metadata: 3,
  },
  tasksColumnSizing: {
    requestedBy: { flex: 4 },
    status: { flex: 2 },
  },
  approvalTitleCellSx: {
    height: "100%",
    justifyContent: "center",
    minWidth: 0,
  } as SxProps<Theme>,
} as const;
