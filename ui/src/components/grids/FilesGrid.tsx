import { Box, LinearProgress, Link } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import prettyBytes from "pretty-bytes";
import { useEffect } from "react";
import { Tab } from "../../models/tab";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/Stores";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import { getHumanReadableRelativeDate } from "../../utils/converters";
import { downloadUserFile } from "../../utils/downloaders";
import ButtonSend from "../buttons/ButtonSend";
import ButtonUpload from "../buttons/ButtonUpload";
import ApprovalRequestSubmitDialog from "../dialogs/ApprovalRequestSubmitDialog";
import UserFileDeleteDialog from "../dialogs/UserFileDeleteDialog";
import UserFileActionsMenu from "../menus/UserFileActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

// Data grid with user files.
const FilesGrid = () => {
  useEffect(() => {
    stores.commonStore.setCurrentTab(Tab.Files);
    stores.fileStore.clearUserFiles();
    stores.fileStore.loadUserFiles();
  }, []);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <ButtonUpload />
        <ButtonSend />
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "createdDate",
      headerName: "Uploaded",
      flex: 2,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 3,
      renderCell: (params) => {
        return (
          <Link
            component="button"
            onClick={() => downloadUserFile(params.row as IUserFile)}
          >
            {params.value}
          </Link>
        );
      },
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 70,
    },
    {
      field: "size",
      headerName: "Size",
      flex: 2,
      valueFormatter: (value) => prettyBytes(value),
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        return <UserFileActionsMenu userFile={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        rows={stores.fileStore.userFiles}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DATA_GRID_DEFAULT_PAGE_SIZE,
            },
          },
        }}
        pageSizeOptions={[DATA_GRID_DEFAULT_PAGE_SIZE]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(items) =>
          stores.fileStore.handleUserFileCheckbox(items as number[])
        }
        slots={{
          toolbar: customToolbar,
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
        }}
        sx={{
          "--DataGrid-overlayHeight": "300px",
        }}
        autoHeight
        loading={
          stores.commonStore.isLoading("get_api/file/list") ||
          stores.commonStore.isLoading("post_api/file/upload") ||
          stores.commonStore.isLoading("delete_api/file")
        }
      />
      <ApprovalRequestSubmitDialog />
      <UserFileDeleteDialog />
    </Box>
  );
};

export default observer(FilesGrid);
