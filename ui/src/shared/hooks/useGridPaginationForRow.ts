import { DataGrids } from "@/shared/constants/constants";
import { GridPaginationModel } from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";

interface RowWithGlobalId {
  globalId: string;
}

export const useGridPaginationForRow = <TRow extends RowWithGlobalId>(
  rows: readonly TRow[],
  currentRowGlobalId?: string,
) => {
  const positionedRowGlobalId = useRef<string>();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DataGrids.defaultPageSize,
  });

  useEffect(() => {
    if (currentRowGlobalId === undefined) {
      positionedRowGlobalId.current = undefined;
      return;
    }

    if (positionedRowGlobalId.current === currentRowGlobalId) {
      return;
    }

    const rowIndex = rows.findIndex((row) => row.globalId === currentRowGlobalId);
    if (rowIndex < 0) {
      return;
    }

    setPaginationModel((current) => {
      const page = Math.floor(rowIndex / current.pageSize);
      return current.page === page ? current : { ...current, page };
    });
    positionedRowGlobalId.current = currentRowGlobalId;
  }, [currentRowGlobalId, rows]);

  return { paginationModel, setPaginationModel };
};
