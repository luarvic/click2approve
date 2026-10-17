import { Flex } from "@/shared/components/layout/flexStyles";
import { PaginationLimits } from "@/shared/config/paginationLimits";
import type { SxProps, Theme } from "@mui/material";
export const DataGrids = {
  compactRowHeightEstimate: 116,
  defaultPageSize: 10,
  pageSizeOptions: [10, PaginationLimits.maximumPageSize],
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
    "& .MuiDataGrid-columnHeader--last .MuiDataGrid-columnSeparator": {
      display: "none",
    },
  } as SxProps<Theme>,
} as const;
