import { deletePasskey, listPasskeys, Passkey, registerPasskey } from "@/features/identity/api/passkeysApi";
import NewPasskeyDialog from "@/features/identity/components/NewPasskeyDialog";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import NoLoadingOverlay from "@/shared/components/overlays/NoLoadingOverlay";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { DataGrids, StackSpacing } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { getHumanReadableRelativeDate, parseUtcDateTime } from "@/shared/utils/dateTime";
import { notification } from "@/shared/utils/notifications";
import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel, GridToolbarContainer } from "@mui/x-data-grid";
import { useState } from "react";

const PasskeySettings = () => {
  const theme = useTheme();
  const allColumnsAreVisible = useMediaQuery(theme.breakpoints.up("md"));
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedCredentialIds, setSelectedCredentialIds] = useState<GridRowSelectionModel>([]);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [newPasskeyDialogIsOpen, setNewPasskeyDialogIsOpen] = useState(false);
  const gridLoader = ActionLoaders.grids.passkeys();
  const addAction = useAsyncAction(ActionLoaders.passkeys.add());
  const removeAction = useAsyncAction();
  const gridIsLoading = useGridRefresh(async () => setPasskeys(await listPasskeys()), refreshVersion, gridLoader);

  const handleAdd = async (name: string) => {
    await addAction.run(async () => {
      if (await registerPasskey(name)) {
        notification.success("Passkey added.");
        setRefreshVersion((version) => version + 1);
      }
    });
  };

  const handleRemove = async (): Promise<boolean> => {
    const removed = await removeAction.run(async () => {
      const allDeleted = (
        await Promise.all(selectedCredentialIds.map((credentialId) => deletePasskey(String(credentialId))))
      ).every(Boolean);
      if (allDeleted) {
        notification.success(selectedCredentialIds.length === 1 ? "Passkey removed." : "Passkeys removed.");
        setRefreshVersion((version) => version + 1);
        setSelectedCredentialIds([]);
      }
      return allDeleted;
    }, ActionLoaders.passkeys.remove(undefined));
    return removed ?? false;
  };

  const customToolbar = () => (
    <GridToolbarContainer>
      <Button
        disabled={gridIsLoading || removeAction.isRunning}
        onClick={() => setNewPasskeyDialogIsOpen(true)}
        startIcon={<Add />}
        type="button"
      >
        New passkey
      </Button>
      <Button
        color="error"
        disabled={gridIsLoading || addAction.isRunning || removeAction.isRunning || selectedCredentialIds.length === 0}
        onClick={() => setDeleteDialogIsOpen(true)}
        startIcon={<Delete />}
        type="button"
      >
        Remove
      </Button>
    </GridToolbarContainer>
  );
  const columns: GridColDef<Passkey>[] = [
    { disableColumnMenu: true, field: "name", flex: 2, headerName: "Name", minWidth: 160, sortable: false },
    {
      disableColumnMenu: true,
      field: "createdAt",
      flex: 2,
      headerName: "Added",
      minWidth: 160,
      sortable: false,
      valueFormatter: (value) => (value ? getHumanReadableRelativeDate(parseUtcDateTime(value)) : "—"),
    },
    {
      disableColumnMenu: true,
      field: "lastUsedAt",
      flex: 2,
      headerName: "Last used",
      minWidth: 160,
      sortable: false,
      valueFormatter: (value) => (value ? getHumanReadableRelativeDate(parseUtcDateTime(value)) : "Never"),
    },
    {
      disableColumnMenu: true,
      field: "credentialId",
      flex: 3,
      headerName: "Passkey ID",
      minWidth: 240,
      sortable: false,
    },
  ];

  return (
    <Stack spacing={StackSpacing.loose}>
      <Typography color="text.secondary">
        Sign in using your device’s biometric, PIN, or security key. Keep your password for account recovery.
      </Typography>
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          autoHeight
          checkboxSelection
          columns={columns}
          columnVisibilityModel={{ credentialId: allColumnsAreVisible, lastUsedAt: allColumnsAreVisible }}
          disableColumnFilter
          disableColumnSelector
          disableRowSelectionOnClick
          getRowId={(row) => row.credentialId}
          hideFooter
          loading={gridIsLoading || addAction.isRunning || removeAction.isRunning}
          onRowSelectionModelChange={setSelectedCredentialIds}
          rows={passkeys}
          rowSelectionModel={selectedCredentialIds}
          slotProps={{ baseCheckbox: { name: "passkey-selection" } }}
          slots={{ loadingOverlay: NoLoadingOverlay, noRowsOverlay: NoRowsOverlay, toolbar: customToolbar }}
          sx={DataGrids.sx}
        />
        <DeleteConfirmationDialog
          cancelLabel="Cancel"
          entityName={selectedCredentialIds.length === 1 ? "this passkey" : `${selectedCredentialIds.length} passkeys`}
          open={deleteDialogIsOpen}
          title="Remove passkeys"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={handleRemove}
        />
        <NewPasskeyDialog
          loading={addAction.isRunning}
          open={newPasskeyDialogIsOpen}
          onClose={() => setNewPasskeyDialogIsOpen(false)}
          onCreate={handleAdd}
        />
      </Box>
    </Stack>
  );
};

export default PasskeySettings;
