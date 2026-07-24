import { stores } from "@/app/rootStore";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
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
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const roleLabels = ["User", "Manager", "Admin"];
const statusLabels = ["Pending", "Active"];

interface EmployeesGridProps {
  currentEmployeeId?: number;
}

const EmployeesGrid: React.FC<EmployeesGridProps> = ({ currentEmployeeId }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallDisplay = useMediaQuery(theme.breakpoints.down("sm"));
  const tenantId = stores.tenantStore.currentTenantId;
  const employeesLoaderPrefix = tenantId ? `api/v1/tenants/${tenantId}/users` : "";
  const canModifyEmployees =
    stores.tenantStore.currentTenant?.role === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.isOwner === true;
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(
    stores.employeeStore.employees,
    currentEmployeeId,
  );

  useEffect(() => {
    stores.employeeStore.clear();
    stores.teamStore.clear();
  }, [tenantId]);

  useGridRefresh(() => {
    if (tenantId) {
      return Promise.all([
        stores.employeeStore.load(tenantId, true),
        stores.teamStore.load(tenantId, true),
      ]).then(() => undefined);
    }
  }, tenantId);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={() =>
            navigate(Routes.tenantPath(tenantId!, "/employees/new"))
          }
        >
          New employee
        </Button>
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "email",
      headerName: "Email",
      ...DataGrids.tenantUsersColumnSizing.email,
    },
    {
      field: "firstName",
      headerName: "First name",
      ...DataGrids.tenantUsersColumnSizing.firstName,
    },
    {
      field: "lastName",
      headerName: "Last name",
      ...DataGrids.tenantUsersColumnSizing.lastName,
    },
    {
      field: "position",
      headerName: "Position",
      ...DataGrids.tenantUsersColumnSizing.position,
    },
    {
      field: "role",
      headerName: "Role",
      ...DataGrids.tenantUsersColumnSizing.role,
      valueFormatter: (value) => roleLabels[value as EmployeeRole],
    },
    {
      field: "status",
      headerName: "Status",
      ...DataGrids.tenantUsersColumnSizing.status,
      renderCell: (params) => {
        const status = params.value as EmployeeStatus;
        return (
          <Chip
            label={statusLabels[status]}
            size="small"
            color={status === EmployeeStatus.Active ? "success" : "default"}
            variant={status === EmployeeStatus.Active ? "filled" : "outlined"}
          />
        );
      },
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.employeeStore.employees}
        columns={columns}
        rowSelectionModel={currentEmployeeId === undefined ? [] : [currentEmployeeId]}
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(
            Routes.tenantPath(tenantId!, `/employees/${(params.row as Employee).id}`),
          )
        }
        columnVisibilityModel={{
          firstName: !isSmallDisplay,
          lastName: !isSmallDisplay,
          position: !isSmallDisplay,
          role: !isSmallDisplay,
        }}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[DataGrids.defaultPageSize]}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          toolbar: canModifyEmployees ? customToolbar : undefined,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={
          stores.commonStore.isLoading(`get_${employeesLoaderPrefix}`) ||
          stores.commonStore.isLoading(`post_${employeesLoaderPrefix}`) ||
          stores.commonStore.isLoadingByPrefix(
            `put_${employeesLoaderPrefix}/`,
          ) ||
          stores.commonStore.isLoadingByPrefix(
            `delete_${employeesLoaderPrefix}/`,
          )
        }
      />
    </Box>
  );
};

export default observer(EmployeesGrid);
