import { ApiToken, createApiToken, deleteApiToken, listApiTokens } from "@/features/identity/api/apiTokensApi";
import ApiTokenCreatedDialog from "@/features/identity/components/ApiTokenCreatedDialog";
import NewApiTokenDialog from "@/features/identity/components/NewApiTokenDialog";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import CompactGridCell from "@/shared/components/grids/CompactGridCell";
import CompactGridSecondaryInformation from "@/shared/components/grids/CompactGridSecondaryInformation";
import CompactGridTitle from "@/shared/components/grids/CompactGridTitle";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { StackSpacing } from "@/shared/theme/tokens";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate, parseUtcDateTime } from "@/shared/utils/dateTime";
import { notification } from "@/shared/utils/notifications";
import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel, GridToolbarContainer } from "@mui/x-data-grid";
import { useState } from "react";

const ApiTokenSettings = () => {
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const [apiTokens, setApiTokens] = useState<ApiToken[]>([]);
  const [createdTokenValue, setCreatedTokenValue] = useState<string | null>(null);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [newApiTokenDialogIsOpen, setNewApiTokenDialogIsOpen] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedTokenGlobalIds, setSelectedTokenGlobalIds] = useState<GridRowSelectionModel>([]);
  const gridLoader = ActionLoaders.grids.apiTokens();
  const addAction = useAsyncAction(ActionLoaders.apiTokens.add());
  const removeAction = useAsyncAction();
  const gridIsLoading = useGridRefresh(async () => setApiTokens(await listApiTokens()), refreshVersion, gridLoader);

  const handleAdd = async (name: string, expiresAt: string | null): Promise<boolean> => {
    const created = await addAction.run(() => createApiToken(name, expiresAt));
    if (!created) return false;

    setCreatedTokenValue(created.value);
    setRefreshVersion((version) => version + 1);
    return true;
  };

  const handleRemove = async (): Promise<boolean> => {
    const removed = await removeAction.run(async () => {
      const allDeleted = (
        await Promise.all(selectedTokenGlobalIds.map((globalId) => deleteApiToken(String(globalId))))
      ).every(Boolean);
      if (allDeleted) {
        notification.success(selectedTokenGlobalIds.length === 1 ? "API token revoked." : "API tokens revoked.");
        setRefreshVersion((version) => version + 1);
        setSelectedTokenGlobalIds([]);
      }
      return allDeleted;
    }, ActionLoaders.apiTokens.remove(undefined));
    return removed ?? false;
  };

  const customToolbar = () => (
    <GridToolbarContainer>
      <Button
        disabled={gridIsLoading || removeAction.isRunning}
        onClick={() => setNewApiTokenDialogIsOpen(true)}
        startIcon={<Add />}
        type="button"
      >
        New API token
      </Button>
      <Button
        color="error"
        disabled={gridIsLoading || addAction.isRunning || removeAction.isRunning || selectedTokenGlobalIds.length === 0}
        onClick={() => setDeleteDialogIsOpen(true)}
        startIcon={<Delete />}
        type="button"
      >
        Revoke
      </Button>
    </GridToolbarContainer>
  );

  const columns: GridColDef<ApiToken>[] = [
    {
      disableColumnMenu: true,
      field: "name",
      flex: 2,
      headerName: "Name",
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <CompactGridCell>
          <CompactGridTitle>
            <Typography variant="body2">{params.row.name}</Typography>
          </CompactGridTitle>
          {!allColumnsAreVisible && (
            <>
              <CompactGridSecondaryInformation>
                Created {getHumanReadableRelativeDate(parseUtcDateTime(params.row.createdAt))}
              </CompactGridSecondaryInformation>
              <CompactGridSecondaryInformation>
                Expires{" "}
                {params.row.expiresAt ? getHumanReadableRelativeDate(parseUtcDateTime(params.row.expiresAt)) : "Never"}
              </CompactGridSecondaryInformation>
            </>
          )}
        </CompactGridCell>
      ),
    },
    {
      disableColumnMenu: true,
      field: "createdAt",
      flex: 2,
      headerName: "Created",
      minWidth: 160,
      sortable: false,
      valueFormatter: (value) => getHumanReadableRelativeDate(parseUtcDateTime(value)),
    },
    {
      disableColumnMenu: true,
      field: "expiresAt",
      flex: 2,
      headerName: "Expires",
      minWidth: 160,
      sortable: false,
      valueFormatter: (value) => (value ? getHumanReadableRelativeDate(parseUtcDateTime(value)) : "Never"),
    },
  ];

  return (
    <Stack spacing={StackSpacing.loose}>
      <Typography color="text.secondary">
        Create revocable tokens for API access. A token is shown only once, so copy it before closing the dialog.
      </Typography>
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          autoHeight
          checkboxSelection
          columns={columns}
          columnVisibilityModel={{ createdAt: allColumnsAreVisible, expiresAt: allColumnsAreVisible }}
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionOnClick
          getEstimatedRowHeight={() => (allColumnsAreVisible ? null : DataGrids.compactRowHeightEstimate)}
          getRowHeight={() => (allColumnsAreVisible ? undefined : "auto")}
          getRowId={(row) => row.globalId}
          hideFooter
          loading={gridIsLoading || addAction.isRunning || removeAction.isRunning}
          onRowSelectionModelChange={setSelectedTokenGlobalIds}
          rowPositionsDebounceMs={DataGrids.compactRowPositionsDebounceMs}
          rows={apiTokens}
          rowSelectionModel={selectedTokenGlobalIds}
          slotProps={{ baseCheckbox: { name: "api-token-selection" } }}
          slots={{ loadingOverlay: NoLoadingOverlay, noRowsOverlay: NoRowsOverlay, toolbar: customToolbar }}
          sx={DataGrids.sx}
        />
        <DeleteConfirmationDialog
          actionLabel="Revoke"
          cancelLabel="Cancel"
          entityName={
            selectedTokenGlobalIds.length === 1 ? "this API token" : `${selectedTokenGlobalIds.length} API tokens`
          }
          open={deleteDialogIsOpen}
          title="Revoke API tokens"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={handleRemove}
        />
        <NewApiTokenDialog
          loading={addAction.isRunning}
          open={newApiTokenDialogIsOpen}
          onClose={() => setNewApiTokenDialogIsOpen(false)}
          onCreate={handleAdd}
        />
        <ApiTokenCreatedDialog
          open={createdTokenValue !== null}
          value={createdTokenValue}
          onClose={() => setCreatedTokenValue(null)}
        />
      </Box>
    </Stack>
  );
};

export default ApiTokenSettings;
