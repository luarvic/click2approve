import { DataGrids } from "@/shared/constants/constants";
import { GridPaginationModel } from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";

interface RowWithId {
  id: number;
}

export const useGridPaginationForRow = <TRow extends RowWithId>(
  rows: readonly TRow[],
  currentRowId?: number,
) => {
  const positionedRowId = useRef<number>();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DataGrids.defaultPageSize,
  });

  useEffect(() => {
    if (currentRowId === undefined) {
      positionedRowId.current = undefined;
      return;
    }

    if (positionedRowId.current === currentRowId) {
      return;
    }

    const rowIndex = rows.findIndex((row) => row.id === currentRowId);
    if (rowIndex < 0) {
      return;
    }

    setPaginationModel((current) => {
      const page = Math.floor(rowIndex / current.pageSize);
      return current.page === page ? current : { ...current, page };
    });
    positionedRowId.current = currentRowId;
  }, [currentRowId, rows]);

  return { paginationModel, setPaginationModel };
};
