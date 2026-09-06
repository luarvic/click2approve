import { stores } from "@/app/rootStore";
import { listApprovalStepTemplateGrid } from "@/features/approvalStepTemplates/api/approvalStepTemplatesApi";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { TeamGridSettings } from "@/features/teams/components/gridSettings";
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

interface ApprovalStepTemplatesGridProps {
  currentTemplateGlobalId?: string;
}

const filterContainerSx: SxProps<Theme> = { mb: 2 };
const filterKeys = ["name"];

const ApprovalStepTemplatesGrid: React.FC<ApprovalStepTemplatesGridProps> = ({ currentTemplateGlobalId }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const gridLoader = ActionLoaders.grids.approvalStepTemplates(tenantGlobalId);
  const query = useMemo(() => parseSimpleGridQuery(searchParams, "name", ["name"], filterKeys), [searchParams]);
  const [templates, setTemplates] = useState<ApprovalStepTemplate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersAreVisible, setFiltersAreVisible] = useState(false);
  const updateQuery = useCallback(
    (updates: Partial<SimpleGridQuery>) => {
      setSearchParams(
        serializeSimpleGridQuery({ ...query, ...updates, filters: { ...query.filters, ...updates.filters } }),
        { replace: true },
      );
    },
    [query, setSearchParams],
  );
  const gridIsLoading = useGridRefresh(
    () =>
      tenantGlobalId
        ? listApprovalStepTemplateGrid(tenantGlobalId, query).then((page) => {
            setTemplates(page.items);
            setTotalCount(page.totalCount);
          })
        : undefined,
    `${tenantGlobalId}:${serializeSimpleGridQuery(query)}`,
    gridLoader,
  );
  const sortModel = useMemo<GridSortModel>(() => [{ field: "name", sort: query.sortDirection }], [query.sortDirection]);
  const customToolbar = () => (
    <GridToolbarContainer>
      <Button
        startIcon={<Add />}
        onClick={() => navigate(Routes.tenantPath(tenantGlobalId!, "/approvalStepTemplates/new"))}
      >
        New template
      </Button>
      <Button
        aria-pressed={filtersAreVisible}
        startIcon={<FilterList />}
        onClick={() => setFiltersAreVisible((current) => !current)}
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
          to={Routes.tenantPath(tenantGlobalId!, `/approvalStepTemplates/${params.row.globalId}`)}
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
          rows={templates}
          getRowId={(row) => row.globalId}
          columns={columns}
          rowSelectionModel={currentTemplateGlobalId === undefined ? [] : [currentTemplateGlobalId]}
          hideFooterSelectedRowCount
          onRowClick={(params) =>
            navigate(
              Routes.tenantPath(
                tenantGlobalId!,
                `/approvalStepTemplates/${(params.row as ApprovalStepTemplate).globalId}`,
              ),
            )
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

export default observer(ApprovalStepTemplatesGrid);
