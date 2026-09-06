import { stores } from "@/app/rootStore";
import { listTeamGrid } from "@/features/teams/api/teamsApi";
import { TeamGridSettings } from "@/features/teams/components/gridSettings";
import { TeamListItem } from "@/features/teams/models/team";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import GridFilters from "@/shared/components/grids/GridFilters";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { parseSimpleGridQuery, serializeSimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Add, FilterList } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import { Box, Button, Link } from "@mui/material";
import type { GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridColDef, GridToolbarContainer } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

interface TeamsGridProps {
  currentTeamGlobalId?: string;
}
const filterContainerSx: SxProps<Theme> = { mb: 2 };
const filterKeys = ["name"];

const TeamsGrid: React.FC<TeamsGridProps> = ({ currentTeamGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.teams(tenantGlobalId);
  const canModifyTeams =
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Admin ||
    stores.tenantStore.currentTenant?.currentEmployeeRole === EmployeeRole.Owner;
  const query = useMemo(() => parseSimpleGridQuery(searchParams, "name", ["name"], filterKeys), [searchParams]);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
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
        ? listTeamGrid(tenantGlobalId, query).then((page) => {
            setTeams(page.items);
            setTotalCount(page.totalCount);
          })
        : undefined,
    `${tenantGlobalId}:${serializeSimpleGridQuery(query)}`,
    gridLoader,
  );
  const sortModel = useMemo<GridSortModel>(() => [{ field: "name", sort: query.sortDirection }], [query.sortDirection]);
  const customToolbar = () => (
    <GridToolbarContainer>
      {canModifyTeams && (
        <Button startIcon={<Add />} onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/teams/new"))}>
          New team
        </Button>
      )}
      <Button
        aria-pressed={filtersAreVisible}
        startIcon={<FilterList />}
        onClick={() => setFiltersAreVisible((value) => !value)}
      >
        {filtersAreVisible ? "Hide filters" : `Show filters${query.filters.name ? " (1)" : ""}`}
      </Button>
    </GridToolbarContainer>
  );
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      ...TeamGridSettings.teamsColumnSizing.name,
      renderCell: (params) => (
        <Link
          component={RouterLink}
          to={Routes.tenantPath(tenantGlobalId!, `/teams/${params.row.globalId}`)}
          tabIndex={params.hasFocus ? 0 : -1}
          onClick={(event) => event.stopPropagation()}
          variant="body2"
        >
          {params.row.name}
        </Link>
      ),
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
            ]}
          />
        </Box>
      )}
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          rows={teams}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentTeamGlobalId === undefined ? [] : [currentTeamGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) =>
            navigate(Routes.tenantPath(tenantGlobalId!, `/teams/${(params.row as TeamListItem).globalId}`))
          }
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
export default observer(TeamsGrid);
