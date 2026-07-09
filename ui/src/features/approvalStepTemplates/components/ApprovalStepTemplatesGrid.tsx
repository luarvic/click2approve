import { stores } from "@/app/stores";
import ApprovalStepTemplateActionsMenu from "@/features/approvalStepTemplates/components/ApprovalStepTemplateActionsMenu";
import ApprovalStepTemplateDialog from "@/features/approvalStepTemplates/components/ApprovalStepTemplateDialog";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { Add } from "@mui/icons-material";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

const ApprovalStepTemplatesGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] =
    useState<ApprovalStepTemplate | null>(null);
  const tenantId = stores.tenantStore.currentTenantId;
  const loaderPrefix = tenantId
    ? `api/tenants/${tenantId}/approvalStepTemplates`
    : "";

  useEffect(() => {
    stores.approvalStepTemplateStore.clear();
    if (tenantId) {
      stores.approvalStepTemplateStore.load(tenantId);
    }
  }, [tenantId]);

  const handleDelete = async (template: ApprovalStepTemplate) => {
    if (!tenantId || !window.confirm(`Delete ${template.name}?`)) {
      return;
    }

    await stores.approvalStepTemplateStore.delete(tenantId, template.id);
  };

  const openCreateDialog = () => {
    setCurrentTemplate(null);
    setDialogIsOpen(true);
  };

  const openEditDialog = (template: ApprovalStepTemplate) => {
    setCurrentTemplate(template);
    setDialogIsOpen(true);
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={openCreateDialog}>
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
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      ...DataGrids.teamsColumnSizing.action,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ApprovalStepTemplateActionsMenu
          template={params.row as ApprovalStepTemplate}
          onEdit={openEditDialog}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.approvalStepTemplateStore.templates}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DataGrids.defaultPageSize,
            },
          },
        }}
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
      <ApprovalStepTemplateDialog
        open={dialogIsOpen}
        template={currentTemplate}
        onClose={() => setDialogIsOpen(false)}
      />
    </Box>
  );
};

export default observer(ApprovalStepTemplatesGrid);
