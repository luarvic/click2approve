import { listTenantGrid } from "@/features/tenants/api/tenantsApi";
import { TenantGridSettings } from "@/features/tenants/components/gridSettings";
import { EmployeeRole, TenantListItem } from "@/features/tenants/models/tenant";
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
const roleOptions = [
  { label: "All roles", value: "" },
  ...Object.entries(roleLabels).map(([value, label]) => ({ label, value })),
];
const filterContainerSx: SxProps<Theme> = { mb: 2 };
const filterKeys = ["name", "role"];
interface TenantsGridProps {
  currentTenantGlobalId?: string;
}

const TenantsGrid: React.FC<TenantsGridProps> = ({ currentTenantGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const gridLoader = ActionLoaders.grids.tenants();
  const query = useMemo(
    () => parseSimpleGridQuery(searchParams, "name", ["name"], filterKeys, ["role"]),
    [searchParams],
  );
  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const appliedFilterCount = Number(Boolean(query.filters.name)) + (query.filters.role as string[]).length;
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
      listTenantGrid(query).then((page) => {
        setTenants(page.items);
        setTotalCount(page.totalCount);
      }),
    serializeSimpleGridQuery(query).toString(),
    gridLoader,
  );
  const sortModel = useMemo<GridSortModel>(
    () => [{ field: "businessName", sort: query.sortDirection }],
    [query.sortDirection],
  );
  const customToolbar = () => (
    <GridToolbarContainer>
      <Button startIcon={<Add />} onClick={() => navigate("/tenants/new")}>
        New organization
      </Button>
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
      field: "businessName",
      headerName: "Name",
      sortable: true,
      ...TenantGridSettings.tenantsColumnSizing.businessName,
      renderCell: (params) => (
        <CompactGridCell>
          <CompactGridTitle>
            <Link
              component={RouterLink}
              to={`/tenants/${params.row.globalId}`}
              tabIndex={params.hasFocus ? 0 : -1}
              onClick={(event) => event.stopPropagation()}
              variant="body2"
            >
              {params.row.businessName}
            </Link>
          </CompactGridTitle>
          {!allColumnsAreVisible && (
            <CompactGridSecondaryInformation>
              {roleLabels[params.row.currentEmployeeRole as EmployeeRole]}
            </CompactGridSecondaryInformation>
          )}
        </CompactGridCell>
      ),
    },
    {
      field: "currentEmployeeRole",
      headerName: "Role",
      sortable: false,
      ...TenantGridSettings.tenantsColumnSizing.currentEmployeeRole,
      valueFormatter: (value) => roleLabels[value as EmployeeRole],
    },
  ];
  return (
    <>
      {filtersAreVisible && (
        <Box sx={filterContainerSx}>
          <GridFilters
            fields={[
              {
                label: "Name",
                onChange: (name) => updateQuery({ page: 0, filters: { name } }),
                value: query.filters.name,
              },
              {
                label: "Role",
                onChange: (role) => updateQuery({ page: 0, filters: { role } }),
                multiple: true,
                options: roleOptions.slice(1),
                value: query.filters.role as string[],
              },
            ]}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          rows={tenants}
          getRowHeight={() => (allColumnsAreVisible ? undefined : "auto")}
          getEstimatedRowHeight={() => (allColumnsAreVisible ? null : DataGrids.compactRowHeightEstimate)}
          rowPositionsDebounceMs={DataGrids.compactRowPositionsDebounceMs}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentTenantGlobalId === undefined ? [] : [currentTenantGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) => navigate(`/tenants/${(params.row as TenantListItem).globalId}`)}
          columnVisibilityModel={{ currentEmployeeRole: allColumnsAreVisible }}
          paginationModel={{ page: query.page, pageSize: query.pageSize }}
          paginationMode="server"
          rowCount={totalCount}
          onPaginationModelChange={(model) => updateQuery({ page: model.page, pageSize: model.pageSize })}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={(model) => updateQuery({ page: 0, sortDirection: model[0]?.sort ?? "asc" })}
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
export default observer(TenantsGrid);
