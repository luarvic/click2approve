import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
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
  currentTemplateId?: number;
}

const ApprovalStepTemplatesGrid: React.FC<ApprovalStepTemplatesGridProps> = ({
  currentTemplateId,
}) => {
  const navigate = useNavigate();
  const tenantId = stores.tenantStore.currentTenantId;
  const loaderPrefix = tenantId
    ? `api/tenants/${tenantId}/approvalStepTemplates`
    : "";
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.approvalStepTemplateStore.templates,
    currentTemplateId,
  );

  useEffect(() => {
    stores.approvalStepTemplateStore.clear();
    if (tenantId) {
      stores.approvalStepTemplateStore.load(tenantId);
    }
  }, [tenantId]);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            navigate(
              Routes.tenantPath(tenantId!, "/approvalStepTemplates/new"),
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
        columns={columns}
        rowSelectionModel={
          currentTemplateId === undefined ? [] : [currentTemplateId]
        }
        onRowClick={(params) =>
          navigate(Routes.tenantPath(
            tenantId!,
            `/approvalStepTemplates/${(params.row as ApprovalStepTemplate).id}`,
          ))
        }
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={
          stores.commonStore.isLoading(`get_${loaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${loaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(`put_${loaderPrefix}/`) ||
          stores.commonStore.isLoadingByPrefix(`delete_${loaderPrefix}/`)
        }
      />
    </Box>
  );
};

export default observer(ApprovalStepTemplatesGrid);
