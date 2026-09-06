import { stores } from "@/app/rootStore";
import { listApprovalDelegationGrid } from "@/features/delegations/api/approvalDelegationsApi";
import { DelegationGridSettings } from "@/features/delegations/components/gridSettings";
import { ApprovalDelegation } from "@/features/delegations/models/approvalDelegation";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import GridFilters from "@/shared/components/grids/GridFilters";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import CompactGridCell from "@/shared/components/grids/CompactGridCell";
import CompactGridSecondaryInformation from "@/shared/components/grids/CompactGridSecondaryInformation";
import CompactGridTitle from "@/shared/components/grids/CompactGridTitle";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { parseSimpleGridQuery, serializeSimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { Add, FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, Link, useMediaQuery, useTheme } from "@mui/material";
import type { GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

interface DelegationsGridProps {
  currentDelegationGlobalId?: string;
}
const filterContainerSx: SxProps<Theme> = { mb: 2 };
const filterKeys = ["employee", "delegate"];

const DelegationsGrid: React.FC<DelegationsGridProps> = ({ currentDelegationGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.delegations(tenantGlobalId);
  const canManageDelegations =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;
  const query = useMemo(
    () => parseSimpleGridQuery(searchParams, "employee", ["employee", "delegate"], filterKeys),
    [searchParams],
  );
  const [delegations, setDelegations] = useState<ApprovalDelegation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const appliedFilterCount = Number(Boolean(query.filters.employee)) + Number(Boolean(query.filters.delegate));
  const employeesById = new Map(stores.employeeStore.pickerEmployees.map((employee) => [employee.globalId, employee]));
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
        ? Promise.all([
            stores.employeeStore.loadPicker(tenantGlobalId),
            listApprovalDelegationGrid(tenantGlobalId, query),
          ]).then(([, page]) => {
            setDelegations(page.items);
            setTotalCount(page.totalCount);
          })
        : undefined,
    `${tenantGlobalId}:${serializeSimpleGridQuery(query)}`,
    gridLoader,
  );
  const sortModel = useMemo<GridSortModel>(
    () => [
      {
        field: query.sortBy === "delegate" ? "delegateEmployeeGlobalId" : "delegatorEmployeeGlobalId",
        sort: query.sortDirection,
      },
    ],
    [query.sortBy, query.sortDirection],
  );
  const getName = (globalId: string) => getEmployeeDisplayName(employeesById.get(globalId));
  const customToolbar = () => (
    <GridToolbarContainer>
      {canManageDelegations && (
        <Button startIcon={<Add />} onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/delegations/new"))}>
          New delegation
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
  const columns: GridColDef[] = [
    {
      field: "delegatorEmployeeGlobalId",
      headerName: "Employee",
      sortable: true,
      ...DelegationGridSettings.delegationsColumnSizing.employee,
      valueGetter: (value) => getName(value as string),
      renderCell: (params) => (
        <CompactGridCell>
          <CompactGridTitle>
            <Link
              component={RouterLink}
              to={Routes.tenantPath(tenantGlobalId!, `/delegations/${params.row.globalId}`)}
              tabIndex={params.hasFocus ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
              variant="body2"
            >
              {getName(params.row.delegatorEmployeeGlobalId)}
            </Link>
          </CompactGridTitle>
          {!allColumnsAreVisible && (
            <CompactGridSecondaryInformation>
              Delegate: {getName(params.row.delegateEmployeeGlobalId)}
            </CompactGridSecondaryInformation>
          )}
        </CompactGridCell>
      ),
    },
    {
      field: "delegateEmployeeGlobalId",
      headerName: "Delegate",
      sortable: true,
      ...DelegationGridSettings.delegationsColumnSizing.delegate,
      valueGetter: (value) => getName(value as string),
      renderCell: (params) => getName(params.row.delegateEmployeeGlobalId),
    },
  ];
  return (
    <>
      {filtersAreVisible && (
        <Box sx={filterContainerSx}>
          <GridFilters
            fields={[
              {
                label: "Employee",
                onChange: (employee) => updateQuery({ page: 0, filters: { employee } }),
                value: query.filters.employee,
              },
              {
                label: "Delegate",
                onChange: (delegate) => updateQuery({ page: 0, filters: { delegate } }),
                value: query.filters.delegate,
              },
            ]}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          rows={delegations}
          getRowHeight={() => (allColumnsAreVisible ? undefined : "auto")}
          getEstimatedRowHeight={() => (allColumnsAreVisible ? null : DataGrids.compactRowHeightEstimate)}
          rowPositionsDebounceMs={DataGrids.compactRowPositionsDebounceMs}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentDelegationGlobalId === undefined ? [] : [currentDelegationGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) =>
            navigate(Routes.tenantPath(tenantGlobalId!, `/delegations/${(params.row as ApprovalDelegation).globalId}`))
          }
          columnVisibilityModel={{ delegateEmployeeGlobalId: allColumnsAreVisible }}
          paginationModel={{ page: query.page, pageSize: query.pageSize }}
          paginationMode="server"
          rowCount={totalCount}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) =>
            updateQuery({
              page: 0,
              sortBy: model[0]?.field === "delegateEmployeeGlobalId" ? "delegate" : "employee",
              sortDirection: model[0]?.sort ?? "asc",
            })
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
export default observer(DelegationsGrid);
