import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalStepTemplatesGridProps {
  currentTemplateGlobalId?: string;
}

const ApprovalStepTemplatesGrid: React.FC<ApprovalStepTemplatesGridProps> = ({
  currentTemplateGlobalId,
}) => {
  const navigate = useNavigate();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.approvalStepTemplates(tenantGlobalId);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalStepTemplateStore.templates,
    currentTemplateGlobalId,
  );

  useEffect(() => {
    stores.approvalStepTemplateStore.clear();
  }, [tenantGlobalId]);

  const gridIsLoading = useGridRefresh(() => {
    if (tenantGlobalId) {
      return stores.approvalStepTemplateStore.load(tenantGlobalId);
    }
  }, tenantGlobalId, gridLoader);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            navigate(
              Routes.tenantPath(tenantGlobalId!, "/approvalStepTemplates/new"),
            )
          }
        >
          New template
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      ...DataGrids.teamsColumnSizing.name,
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.approvalStepTemplateStore.templates}
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={
          currentTemplateGlobalId === undefined ? [] : [currentTemplateGlobalId]
        }
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(Routes.tenantPath(
            tenantGlobalId!,
            `/approvalStepTemplates/${(params.row as ApprovalStepTemplate).globalId}`,
          ))
        }
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default observer(ApprovalStepTemplatesGrid);
