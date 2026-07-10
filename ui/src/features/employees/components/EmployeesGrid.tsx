import { stores } from "@/app/rootStore";
import EmployeeActionsMenu from "@/features/employees/components/EmployeeActionsMenu";
import EmployeeDialog from "@/features/employees/components/EmployeeDialog";
import {
  CreateEmployeeRequest,
  Employee,
  EmployeeStatus,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids } from "@/shared/constants/constants";
import { Add } from "@mui/icons-material";
import { Box, Button, Chip, LinearProgress } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";

const roleLabels = ["User", "Manager", "Admin"];
const statusLabels = ["Pending", "Active"];

const syncEmployeeTeams = async (
  tenantId: number,
  employeeId: number,
  selectedTeamIds: number[],
): Promise<boolean> => {
  const selected = new Set(selectedTeamIds);
  for (const team of stores.teamStore.teams) {
    const currentMemberIds = team.members.map((member) => member.id);
    const hasMember = currentMemberIds.includes(employeeId);
    const shouldHaveMember = selected.has(team.id);
    if (hasMember === shouldHaveMember) {
      continue;
    }

    const nextMemberIds = shouldHaveMember
      ? [...currentMemberIds, employeeId]
      : currentMemberIds.filter((id) => id !== employeeId);
    const updated = await stores.teamStore.update(tenantId, team.id, {
      name: team.name,
      employeeIds: nextMemberIds,
    });
    if (!updated) {
      return false;
    }
  }

  return true;
};

const EmployeesGrid = () => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(
    null,
  );
  const tenantId = stores.tenantStore.currentTenantId;
  const employeesLoaderPrefix = tenantId ? `api/tenants/${tenantId}/users` : "";
  const canModifyEmployees =
    stores.tenantStore.currentTenant?.role === EmployeeRole.Admin;
  const teams = stores.teamStore.teams;
  const selectedTeamIds = useMemo(
    () =>
      currentEmployee
        ? teams
          .filter((team) =>
            team.members.some(
              (member) => member.id === currentEmployee.id,
            ),
          )
          .map((team) => team.id)
        : [],
    [currentEmployee, teams],
  );

  useEffect(() => {
    stores.employeeStore.clear();
    stores.teamStore.clear();
    if (tenantId) {
      stores.employeeStore.load(tenantId);
      stores.teamStore.load(tenantId);
    }
  }, [tenantId]);

  const openCreateDialog = () => {
    setCurrentEmployee(null);
    setDialogIsOpen(true);
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setDialogIsOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (!tenantId || !window.confirm(`Delete ${employee.email}?`)) {
      return;
    }

    await stores.employeeStore.delete(tenantId, employee.id);
  };

  const handleSubmit = async (
    payload: CreateEmployeeRequest | UpdateEmployeeRequest,
    teamIds: number[],
    employeeId?: number,
  ): Promise<boolean> => {
    if (!tenantId) {
      return false;
    }

    const savedEmployee = employeeId
      ? await stores.employeeStore.update(
        tenantId,
        employeeId,
        payload as UpdateEmployeeRequest,
      )
      : await stores.employeeStore.create(tenantId, payload as CreateEmployeeRequest);
    if (!savedEmployee) {
      return false;
    }

    const updatedTeams = await syncEmployeeTeams(
      tenantId,
      savedEmployee.id,
      teamIds,
    );
    if (updatedTeams) {
      await stores.teamStore.load(tenantId);
    }

    return updatedTeams;
  };

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={openCreateDialog}>
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
    ...(canModifyEmployees
      ? [
        {
          field: "action",
          headerName: "Action",
          headerAlign: "right",
          align: "right",
          ...DataGrids.tenantUsersColumnSizing.action,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <EmployeeActionsMenu
              employee={params.row as Employee}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ),
        } as GridColDef,
      ]
      : []),
  ];

  return (
    <Box sx={DataGrids.containerSx}>
      <DataGrid
        rows={stores.employeeStore.employees}
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
      {canModifyEmployees && (
        <EmployeeDialog
          open={dialogIsOpen}
          employee={currentEmployee}
          teams={teams}
          selectedTeamIds={selectedTeamIds}
          onClose={() => setDialogIsOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
};

export default observer(EmployeesGrid);
