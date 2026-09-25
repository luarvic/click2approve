import { createReceiptLink, deleteReceiptLink, getReceipt } from "@/features/receipts/api/receiptsApi";
import NewReceiptLinkDialog from "@/features/receipts/components/NewReceiptLinkDialog";
import ReceiptLinkDialog from "@/features/receipts/components/ReceiptLinkDialog";
import type { ReceiptLink } from "@/features/receipts/models/receipt";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import CompactGridCell from "@/shared/components/grids/CompactGridCell";
import CompactGridSecondaryInformation from "@/shared/components/grids/CompactGridSecondaryInformation";
import CompactGridTitle from "@/shared/components/grids/CompactGridTitle";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";
import NoRowsOverlay from "@/shared/components/overlays/NoRowsOverlay";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useGridRefresh } from "@/shared/hooks/useGridRefresh";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { StackSpacing } from "@/shared/theme/tokens";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { Add, Delete } from "@mui/icons-material";
import { Box, Button, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridRowId, GridToolbarContainer } from "@mui/x-data-grid";
import { useState } from "react";

interface ReceiptLinksGridProps {
  receiptGlobalId: string;
  tenantGlobalId: string;
}

const formatDate = (date: Date) => date.toLocaleDateString();

const ReceiptLinksGrid = ({ receiptGlobalId, tenantGlobalId }: ReceiptLinksGridProps) => {
  const allColumnsAreVisible = useMediaQuery(useTheme().breakpoints.up("md"));
  const [links, setLinks] = useState<ReceiptLink[]>([]);
  const [selectedIds, setSelectedIds] = useState<GridRowId[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const addAction = useAsyncAction(ActionLoaders.receiptLinks.create(receiptGlobalId));
  const removeAction = useAsyncAction(ActionLoaders.receiptLinks.delete(receiptGlobalId));
  const gridIsLoading = useGridRefresh(
    async () => {
      const receipt = await getReceipt(tenantGlobalId, receiptGlobalId);
      setUnavailable(!receipt?.canManageLinks);
      setLinks(receipt?.links ?? []);
      setSelectedIds((ids) => ids.filter((id) => receipt?.links.some((link) => link.globalId === id)));
    },
    refreshVersion,
    ActionLoaders.receiptLinks.load(receiptGlobalId),
  );
  const busy = gridIsLoading || addAction.isRunning || removeAction.isRunning;
  const handleCreate = async (expiresAt: Date) =>
    (await addAction.run(async () => {
      const id = await createReceiptLink(tenantGlobalId, receiptGlobalId, expiresAt);
      if (!id) return false;
      notification.success("Receipt link created.");
      setRefreshVersion((version) => version + 1);
      return true;
    })) ?? false;
  const handleRemove = async () =>
    (await removeAction.run(async () => {
      const results = await Promise.all(
        selectedIds.map(async (id) => ({
          id,
          removed: await deleteReceiptLink(tenantGlobalId, receiptGlobalId, String(id)),
        })),
      );
      const removedIds = results.filter((result) => result.removed).map((result) => result.id);
      setSelectedIds((ids) => ids.filter((id) => !removedIds.includes(id)));
      setRefreshVersion((version) => version + 1);
      if (removedIds.length > 0)
        notification.success(removedIds.length === 1 ? "Receipt link removed." : "Receipt links removed.");
      return results.every((result) => result.removed);
    })) ?? false;
  const toolbar = () => (
    <GridToolbarContainer>
      <Button disabled={busy} onClick={() => setCreating(true)} startIcon={<Add />}>
        New link
      </Button>
      <Button
        color="error"
        disabled={busy || selectedIds.length === 0}
        onClick={() => setRemoving(true)}
        startIcon={<Delete />}
      >
        Remove
      </Button>
    </GridToolbarContainer>
  );
  const columns: GridColDef<ReceiptLink>[] = [
    {
      field: "globalId",
      headerName: "Link",
      flex: 2,
      minWidth: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <CompactGridCell>
          <CompactGridTitle>
            <Link component="button" variant="body2" onClick={() => setSelectedLink(row.globalId)}>
              {row.globalId}
            </Link>
          </CompactGridTitle>
          {!allColumnsAreVisible && (
            <>
              <CompactGridSecondaryInformation>Created {formatDate(row.createdAt)}</CompactGridSecondaryInformation>
              <CompactGridSecondaryInformation>Expires {formatDate(row.expiresAt)}</CompactGridSecondaryInformation>
            </>
          )}
        </CompactGridCell>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: Date) => formatDate(value),
    },
    {
      field: "expiresAt",
      headerName: "Expires",
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: Date) => formatDate(value),
    },
  ];

  if (unavailable) return <NotFoundPage />;
  return (
    <Stack spacing={StackSpacing.loose}>
      <Typography color="text.secondary">
        Anyone with a public link can view this receipt until the link expires or is removed.
      </Typography>
      <Box sx={DataGrids.containerSx}>
        <DataGrid
          showToolbar
          autoHeight
          checkboxSelection
          disableRowSelectionExcludeModel
          columns={columns}
          columnVisibilityModel={{ createdAt: allColumnsAreVisible, expiresAt: allColumnsAreVisible }}
          disableColumnFilter
          disableColumnMenu
          disableColumnSelector
          disableRowSelectionOnClick
          getRowId={(row) => row.globalId}
          getRowHeight={() => (allColumnsAreVisible ? undefined : "auto")}
          getEstimatedRowHeight={() => (allColumnsAreVisible ? null : DataGrids.compactRowHeightEstimate)}
          hideFooter
          loading={busy}
          onRowSelectionModelChange={(selection) => setSelectedIds([...selection.ids])}
          rows={links}
          rowSelectionModel={{ type: "include", ids: new Set(selectedIds) }}
          slotProps={{
            baseCheckbox: { name: "receipt-link-selection" },
          }}
          slots={{ noRowsOverlay: NoRowsOverlay, toolbar }}
          sx={DataGrids.sx}
        />
      </Box>
      <DeleteConfirmationDialog
        actionLabel="Remove"
        cancelLabel="Cancel"
        entityName={selectedIds.length === 1 ? "this receipt link" : `${selectedIds.length} receipt links`}
        open={removing}
        title="Remove receipt links"
        onClose={() => setRemoving(false)}
        onDelete={handleRemove}
      />
      {selectedLink && <ReceiptLinkDialog linkGlobalId={selectedLink} onClose={() => setSelectedLink(null)} />}
      {creating && (
        <NewReceiptLinkDialog
          loading={addAction.isRunning}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
        />
      )}
    </Stack>
  );
};

export default ReceiptLinksGrid;
