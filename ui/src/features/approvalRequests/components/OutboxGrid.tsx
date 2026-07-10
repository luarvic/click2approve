import { stores } from "@/app/rootStore";
import ApprovalRequestActionsMenu from "@/features/approvalRequests/components/ApprovalRequestActionsMenu";
import ApprovalRequestDeleteDialog from "@/features/approvalRequests/components/ApprovalRequestDeleteDialog";
import ApprovalRequestViewDialog from "@/features/approvalRequests/components/ApprovalRequestViewDialog";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { getHumanReadableRelativeDate } from "@/shared/utils/helpers";
import { Add } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const OutboxGrid = () => {
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);

  const getStatusChipColor = (status: ApprovalRequestStatus) => {
    switch (status) {
      case ApprovalRequestStatus.Approved:
        return "success" as const;
      case ApprovalRequestStatus.Rejected:
        return "error" as const;
      default:
        return "default" as const;
    }
  };

  useEffect(() => {
    if (!tenantScopeIsReady) {
      return;
    }

    stores.approvalRequestStore.clear();
    stores.approvalRequestStore.load();
  }, [tenantScopeIsReady]);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true)
          }
        >
          New request
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: DataGrids.approvalColumnFlex.content,
      valueGetter: (_value, row) => row.title,
    },
    {
      field: "status",
      headerName: "Status",
      flex: DataGrids.approvalColumnFlex.metadata,
      renderCell: (params) => {
        const label = ApprovalRequestStatus[params.row.status];
        return (
          <Chip
            label={label}
            size="small"
            color={getStatusChipColor(params.row.status)}
          />
        );
      },
      valueGetter: (_value, row) => ApprovalRequestStatus[row.status],
    },
    {
      field: "createdAtDate",
      headerName: "Created",
      flex: DataGrids.approvalColumnFlex.metadata,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
    {
      field: "actions",
      headerName: "Actions",
      headerAlign: "right",
      align: "right",
      flex: DataGrids.approvalColumnFlex.action,
      renderCell: (params) => {
        return <ApprovalRequestActionsMenu approvalRequest={params.row} />;
      },
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.approvalRequestStore.approvalRequests}
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
          stores.commonStore.isLoading("get_api/request/list") ||
          stores.commonStore.isLoading("delete_api/request")
        }
      />
      <ApprovalRequestViewDialog />
      <ApprovalRequestDeleteDialog />
    </Box>
  );
};

export default observer(OutboxGrid);
