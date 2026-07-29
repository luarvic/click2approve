import { stores } from "@/app/rootStore";
import { listApprovalDelegations } from "@/features/delegations/api/approvalDelegationsApi";
import { ApprovalDelegation } from "@/features/delegations/models/approvalDelegation";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  LinearProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DelegationsGridProps {
  currentDelegationGlobalId?: string;
}

const unknownEmployeeLabel = "Unknown employee";

const DelegationsGrid: React.FC<DelegationsGridProps> = ({
  currentDelegationGlobalId,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const delegationsLoaderPrefix = tenantGlobalId
    ? `api/v1/tenants/${tenantGlobalId}/delegations`
    : "";
  const employeesLoaderPrefix = tenantGlobalId
    ? `api/v1/tenants/${tenantGlobalId}/users`
    : "";
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    delegations,
    currentDelegationGlobalId,
  );
  const employeeNames = new Map(
    stores.employeeStore.employees.map((employee) => [
      employee.globalId,
      employee.displayName,
    ]),
  );

  useEffect(() => {
    setDelegations([]);
    stores.employeeStore.clear();
  }, [tenantGlobalId]);

  useGridRefresh(() => {
    if (tenantGlobalId) {
      return Promise.all([
        stores.employeeStore.load(tenantGlobalId, true),
        listApprovalDelegations(tenantGlobalId).then(setDelegations),
      ]).then(() => undefined);
    }
  }, tenantGlobalId);

  const getEmployeeName = (employeeGlobalId: string) =>
    employeeNames.get(employeeGlobalId) ?? unknownEmployeeLabel;

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            navigate(Routes.tenantPath(tenantGlobalId!, "/delegations/new"))
          }
        >
          New delegation
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "delegatorEmployeeGlobalId",
      headerName: "Employee",
      ...DataGrids.delegationsColumnSizing.employee,
      valueGetter: (value) => getEmployeeName(value as string),
    },
    {
      field: "delegateEmployeeGlobalId",
      headerName: "Delegate",
      ...DataGrids.delegationsColumnSizing.delegate,
      valueGetter: (value) => getEmployeeName(value as string),
    },
    {
      field: "createdAt",
      headerName: "Created",
      ...DataGrids.delegationsColumnSizing.createdAt,
      valueFormatter: (value) =>
        value ? new Date(value as string).toLocaleDateString() : "",
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={delegations}
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={
          currentDelegationGlobalId === undefined ? [] : [currentDelegationGlobalId]
        }
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(
            Routes.tenantPath(
              tenantGlobalId!,
              `/delegations/${(params.row as ApprovalDelegation).globalId}`,
            ),
          )
        }
        columnVisibilityModel={{
          createdAt: !isSmallDisplay,
        }}
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
          stores.commonStore.isLoading(`get_${delegationsLoaderPrefix}`) ||
          stores.commonStore.isLoading(`get_${employeesLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${delegationsLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(
            `put_${delegationsLoaderPrefix}/`,
          ) ||
          stores.commonStore.isLoadingByPrefix(
            `delete_${delegationsLoaderPrefix}/`,
          )
        }
      />
    </Box>
  );
};

export default observer(DelegationsGrid);
