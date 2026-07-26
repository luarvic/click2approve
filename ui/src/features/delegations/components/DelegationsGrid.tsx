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
  currentDelegationId?: number;
}

const unknownEmployeeLabel = "Unknown employee";

const DelegationsGrid: React.FC<DelegationsGridProps> = ({
  currentDelegationId,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const tenantId = stores.tenantStore.currentTenantId;
  const delegationsLoaderPrefix = tenantId
    ? `api/v1/tenants/${tenantId}/delegations`
    : "";
  const employeesLoaderPrefix = tenantId
    ? `api/v1/tenants/${tenantId}/users`
    : "";
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    delegations,
    currentDelegationId,
  );
  const employeeNames = new Map(
    stores.employeeStore.employees.map((employee) => [
      employee.id,
      employee.displayName,
    ]),
  );

  useEffect(() => {
    setDelegations([]);
    stores.employeeStore.clear();
  }, [tenantId]);

  useGridRefresh(() => {
    if (tenantId) {
      return Promise.all([
        stores.employeeStore.load(tenantId, true),
        listApprovalDelegations(tenantId).then(setDelegations),
      ]).then(() => undefined);
    }
  }, tenantId);

  const getEmployeeName = (employeeId: number) =>
    employeeNames.get(employeeId) ?? unknownEmployeeLabel;

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            navigate(Routes.tenantPath(tenantId!, "/delegations/new"))
          }
        >
          New delegation
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "delegatorEmployeeId",
      headerName: "Employee",
      ...DataGrids.delegationsColumnSizing.employee,
      valueGetter: (value) => getEmployeeName(value as number),
    },
    {
      field: "delegateEmployeeId",
      headerName: "Delegate",
      ...DataGrids.delegationsColumnSizing.delegate,
      valueGetter: (value) => getEmployeeName(value as number),
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
        columns={columns}
        rowSelectionModel={
          currentDelegationId === undefined ? [] : [currentDelegationId]
        }
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(
            Routes.tenantPath(
              tenantId!,
              `/delegations/${(params.row as ApprovalDelegation).id}`,
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
