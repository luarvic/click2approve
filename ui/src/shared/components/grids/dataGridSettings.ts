import { Flex } from "@/shared/components/layout/flexStyles";
import type { SxProps, Theme } from "@mui/material";
export const DataGrids = {
  compactRowHeightEstimate: 116,
  compactRowPositionsDebounceMs: 0,
  defaultPageSize: 10,
  pageSizeOptions: [10, 100],
  containerSx: Flex.fullWidthOverflowHiddenSx,
  sx: {
    border: "none",
    "--DataGrid-overlayHeight": "300px",
    "& .MuiDataGrid-cell": {
      alignItems: "center",
    },
    "& .MuiDataGrid-row": {
      cursor: "pointer",
    },
  } as SxProps<Theme>,
} as const;
