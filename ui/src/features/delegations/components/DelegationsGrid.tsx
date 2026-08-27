import { stores } from "@/app/rootStore";
import { listApprovalDelegations } from "@/features/delegations/api/approvalDelegationsApi";
import { ApprovalDelegation } from "@/features/delegations/models/approvalDelegation";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import OneLineDisplayName from "@/shared/components/identity/OneLineDisplayName";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import { DataGrids, Routes } from "@/shared/constants/constants";
import { useGridPaginationForRow } from "@/shared/hooks/useGridPaginationForRow";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { Add } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface DelegationsGridProps {
  currentDelegationGlobalId?: string;
}

const DelegationsGrid: React.FC<DelegationsGridProps> = ({ currentDelegationGlobalId }) => {
  const navigate = useNavigate();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const canManageDelegations =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;
  const gridLoader = ActionLoaders.grids.delegations(tenantGlobalId);
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const { paginationModel, setPaginationModel } = useGridPaginationForRow(delegations, currentDelegationGlobalId);
  const employeesById = new Map(stores.employeeStore.pickerEmployees.map((employee) => [employee.globalId, employee]));

  useEffect(() => {
    setDelegations([]);
    stores.employeeStore.clear();
  }, [tenantGlobalId]);

  const gridIsLoading = useGridRefresh(
    () => {
      if (tenantGlobalId) {
        return Promise.all([
          stores.employeeStore.loadPicker(tenantGlobalId),
          listApprovalDelegations(tenantGlobalId).then(setDelegations),
        ]).then(() => undefined);
      }
    },
    tenantGlobalId,
    gridLoader,
  );

  const getEmployeeName = (employeeGlobalId: string) => {
    const employee = employeesById.get(employeeGlobalId);
    return getEmployeeDisplayName(employee);
  };

  const renderEmployee = (employeeGlobalId: string) => {
    const employee = employeesById.get(employeeGlobalId);
    return <OneLineDisplayName displayName={getEmployeeDisplayName(employee)} variant="body2" />;
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/delegations/new"))}>
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
      renderCell: (params) => renderEmployee(params.row.delegatorEmployeeGlobalId),
    },
    {
      field: "delegateEmployeeGlobalId",
      headerName: "Delegate",
      ...DataGrids.delegationsColumnSizing.delegate,
      valueGetter: (value) => getEmployeeName(value as string),
      renderCell: (params) => renderEmployee(params.row.delegateEmployeeGlobalId),
    },
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={delegations}
        getRowId={(row) => row.globalId}
        columns={columns}
        rowSelectionModel={currentDelegationGlobalId === undefined ? [] : [currentDelegationGlobalId]}
        hideFooterSelectedRowCount
        onRowClick={(params) =>
          navigate(Routes.tenantPath(tenantGlobalId!, `/delegations/${(params.row as ApprovalDelegation).globalId}`))
        }
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={DataGrids.pageSizeOptions}
        disableColumnFilter
        disableRowSelectionOnClick
        slots={{
          loadingOverlay: NoLoadingOverlay,
          toolbar: canManageDelegations ? customToolbar : undefined,
          noRowsOverlay: NoRowsOverlay,
        }}
        sx={DataGrids.sx}
        autoHeight
        loading={gridIsLoading}
      />
    </Box>
  );
};

export default observer(DelegationsGrid);
