import { stores } from "@/app/rootStore";
import { listEmployeeGrid } from "@/features/employees/api/employeesApi";
import { EmployeeGridSettings } from "@/features/employees/components/gridSettings";
import { EmployeeListItem, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import GridFilters from "@/shared/components/grids/GridFilters";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import CompactGridCell from "@/shared/components/grids/CompactGridCell";
import CompactGridSecondaryInformation from "@/shared/components/grids/CompactGridSecondaryInformation";
import CompactGridStatus from "@/shared/components/grids/CompactGridStatus";
import CompactGridTitle from "@/shared/components/grids/CompactGridTitle";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { StatusLineLabel } from "@/shared/components/status/StatusLines";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { parseSimpleGridQuery, serializeSimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Add, FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, Link, useMediaQuery, useTheme } from "@mui/material";
import type { GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

const roleLabels: Record<EmployeeRole, string> = {
  [EmployeeRole.User]: "User",
  [EmployeeRole.Admin]: "Admin",
  [EmployeeRole.Owner]: "Owner",
};
const statusLabels: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Pending]: "Invitation sent",
  [EmployeeStatus.Active]: "Active",
  [EmployeeStatus.Disabled]: "Disabled",
};
interface EmployeesGridProps {
  currentEmployeeGlobalId?: string;
}
const filterContainerSx: SxProps<Theme> = { mb: 2 };
const filterKeys = ["email", "firstName", "lastName", "position", "role", "status"];
const roleOptions = [
  { label: "All roles", value: "" },
  ...Object.entries(roleLabels).map(([value, label]) => ({ label, value })),
];
const statusOptions = [
  { label: "All statuses", value: "" },
  ...Object.entries(statusLabels).map(([value, label]) => ({ label, value })),
];

const EmployeesGrid: React.FC<EmployeesGridProps> = ({ currentEmployeeGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.employees(tenantGlobalId);
  const canModifyEmployees =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;
  const query = useMemo(
    () =>
      parseSimpleGridQuery(searchParams, "email", ["email", "firstName", "lastName"], filterKeys, ["role", "status"]),
    [searchParams],
  );
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const appliedFilterCount =
    Number(Boolean(query.filters.email)) +
    Number(Boolean(query.filters.firstName)) +
    Number(Boolean(query.filters.lastName)) +
    Number(Boolean(query.filters.position)) +
    (query.filters.role as string[]).length +
    (query.filters.status as string[]).length;
  const updateQuery = useCallback(
    (updates: Partial<SimpleGridQuery>) =>
      setSearchParams(
        serializeSimpleGridQuery({ ...query, ...updates, filters: { ...query.filters, ...updates.filters } }),
        { replace: true },
      ),
    [query, setSearchParams],
  );
  const gridIsLoading = useGridRefresh(
    () =>
      tenantGlobalId
        ? listEmployeeGrid(tenantGlobalId, query).then((page) => {
            setEmployees(page.items);
            setTotalCount(page.totalCount);
          })
        : undefined,
    `${tenantGlobalId}:${serializeSimpleGridQuery(query)}`,
    gridLoader,
  );
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: query.sortBy, sort: query.sortDirection }],
    [query.sortBy, query.sortDirection],
  );
  const customToolbar = () => (
    <GridToolbarContainer>
      {canModifyEmployees && (
        <Button startIcon={<Add />} onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/employees/new"))}>
          New employee
        </Button>
      )}
      <Button
        aria-pressed={filtersAreVisible}
        startIcon={<FilterList />}
        onClick={() => setFiltersAreVisible((value) => !value)}
      >
        {filtersAreVisible ? "Hide filters" : `Show filters${appliedFilterCount > 0 ? ` (${appliedFilterCount})` : ""}`}
      </Button>
    </GridToolbarContainer>
  );
  const filter = (key: string) => (value: string | string[]) => updateQuery({ page: 0, filters: { [key]: value } });
  const columns: GridColDef[] = [
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      ...EmployeeGridSettings.tenantUsersColumnSizing.email,
      renderCell: (params) => (
        <CompactGridCell>
          <CompactGridTitle>
            <Link
              component={RouterLink}
              to={Routes.tenantPath(tenantGlobalId!, `/employees/${params.row.globalId}`)}
              tabIndex={params.hasFocus ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
              variant="body2"
            >
              {params.row.email}
            </Link>
          </CompactGridTitle>
          {!allColumnsAreVisible && (
            <>
              {params.row.status !== undefined && (
                <CompactGridStatus>
                  <StatusLineLabel
                    label={statusLabels[params.row.status as EmployeeStatus]}
                    color={params.row.status === EmployeeStatus.Active ? "started" : "other"}
                    lineVariant="solid"
                  />
                </CompactGridStatus>
              )}
              {(params.row.firstName || params.row.lastName) && (
                <CompactGridSecondaryInformation>
                  {[params.row.firstName, params.row.lastName].filter(Boolean).join(" ")}
                </CompactGridSecondaryInformation>
              )}
              {params.row.position && (
                <CompactGridSecondaryInformation>{params.row.position}</CompactGridSecondaryInformation>
              )}
              {params.row.role !== undefined && (
                <CompactGridSecondaryInformation>
                  {roleLabels[params.row.role as EmployeeRole]}
                </CompactGridSecondaryInformation>
              )}
            </>
          )}
        </CompactGridCell>
      ),
    },
    {
      field: "firstName",
      headerName: "First name",
      sortable: true,
      ...EmployeeGridSettings.tenantUsersColumnSizing.firstName,
    },
    {
      field: "lastName",
      headerName: "Last name",
      sortable: true,
      ...EmployeeGridSettings.tenantUsersColumnSizing.lastName,
    },
    {
      field: "position",
      headerName: "Position",
      sortable: false,
      ...EmployeeGridSettings.tenantUsersColumnSizing.position,
    },
    {
      field: "role",
      headerName: "Role",
      sortable: false,
      ...EmployeeGridSettings.tenantUsersColumnSizing.role,
      valueFormatter: (value) => roleLabels[value as EmployeeRole],
    },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      ...EmployeeGridSettings.tenantUsersColumnSizing.status,
      renderCell: (params) => (
        <StatusLineLabel
          label={statusLabels[params.row.status as EmployeeStatus]}
          color={params.row.status === EmployeeStatus.Active ? "started" : "other"}
          lineVariant="solid"
        />
      ),
    },
  ];
  return (
    <>
      {filtersAreVisible && (
        <Box sx={filterContainerSx}>
          <GridFilters
            fields={[
              { label: "Email", onChange: filter("email"), value: query.filters.email },
              { label: "First name", onChange: filter("firstName"), value: query.filters.firstName },
              { label: "Last name", onChange: filter("lastName"), value: query.filters.lastName },
              { label: "Position", onChange: filter("position"), value: query.filters.position },
              {
                label: "Role",
                multiple: true,
                onChange: filter("role"),
                options: roleOptions.slice(1),
                value: query.filters.role as string[],
              },
              {
                label: "Status",
                multiple: true,
                onChange: filter("status"),
                options: statusOptions.slice(1),
                value: query.filters.status as string[],
              },
            ]}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          rows={employees}
          getRowHeight={() => (allColumnsAreVisible ? undefined : "auto")}
          getEstimatedRowHeight={() => (allColumnsAreVisible ? null : DataGrids.compactRowHeightEstimate)}
          rowPositionsDebounceMs={DataGrids.compactRowPositionsDebounceMs}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentEmployeeGlobalId === undefined ? [] : [currentEmployeeGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) =>
            navigate(Routes.tenantPath(tenantGlobalId!, `/employees/${(params.row as EmployeeListItem).globalId}`))
          }
          columnVisibilityModel={{
            firstName: allColumnsAreVisible,
            lastName: allColumnsAreVisible,
            position: allColumnsAreVisible,
            role: allColumnsAreVisible,
            status: allColumnsAreVisible,
          }}
          paginationModel={{ page: query.page, pageSize: query.pageSize }}
          paginationMode="server"
          rowCount={totalCount}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) =>
            updateQuery({ page: 0, sortBy: model[0]?.field ?? "email", sortDirection: model[0]?.sort ?? "asc" })
          }
          pageSizeOptions={DataGrids.pageSizeOptions}
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionOnClick
          slots={{ loadingOverlay: NoLoadingOverlay, toolbar: customToolbar, noRowsOverlay: NoRowsOverlay }}
          sx={DataGrids.sx}
          autoHeight
          loading={gridIsLoading}
        />
      </Box>
    </>
  );
};
export default observer(EmployeesGrid);
