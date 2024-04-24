import {
  Box,
  LinearProgress,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridSlots,
  GridToolbarContainer,
} from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import prettyBytes from "pretty-bytes";
import { useEffect } from "react";
import {
  DATA_GRID_DEFAULT_PAGE_SIZE,
  MAX_SIZE_WHEN_DISPLAY,
} from "../../data/constants";
import { Tab } from "../../models/tab";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/stores";
import { downloadUserFile } from "../../utils/downloaders";
import { getHumanReadableRelativeDate } from "../../utils/helpers";
import GridToolbarButtons from "../buttons/GridToolbarButtons";
import SendButton from "../buttons/SendButton";
import UploadButton from "../buttons/UploadButton";
import ApprovalRequestSubmitDialog from "../dialogs/ApprovalRequestSubmitDialog";
import UserFileDeleteDialog from "../dialogs/UserFileDeleteDialog";
import UserFileActionsMenu from "../menus/UserFileActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

// Data grid with user files.
const FilesGrid = () => {
  const theme = useTheme();

  useEffect(() => {
    stores.commonStore.setCurrentTab(Tab.Files);
    stores.userFileStore.clearUserFiles();
    stores.userFileStore.loadUserFiles();
  }, []);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <UploadButton />
        <SendButton />
        <GridToolbarButtons />
      </GridToolbarContainer>
    );
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "File name",
      flex: 10,
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
      field: "createdDate",
      headerName: "Uploaded",
      flex: 3,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
    {
      field: "type",
      headerName: "Type",
      flex: 3,
      minWidth: 70,
    },
    {
      field: "size",
      headerName: "Size",
      flex: 3,
      valueFormatter: (value) => prettyBytes(value),
    },
    {
      field: "action",
      headerName: "Action",
      headerAlign: "right",
      align: "right",
      flex: 1,
      renderCell: (params) => {
        return <UserFileActionsMenu userFile={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        rows={stores.userFileStore.userFiles}
        columns={columns}
        columnVisibilityModel={{
          createdDate: useMediaQuery(
            theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)
          ),
          type: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
          size: useMediaQuery(theme.breakpoints.up(MAX_SIZE_WHEN_DISPLAY)),
        }}
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
          stores.userFileStore.handleUserFileCheckbox(items as number[])
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
