import { Box, Link } from "@mui/material";
import {
  DataGrid,
  GridColDef,
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
import { commonStore } from "../../stores/commonStore";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import { fileStore } from "../../stores/fileStore";
import { getHumanReadableRelativeDate } from "../../utils/converters";
import { downloadUserFile } from "../../utils/downloaders";
import ButtonSend from "../buttons/ButtonSend";
import ButtonUpload from "../buttons/ButtonUpload";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

// Data grid with user files.
const FilesGrid = () => {
  const { setCurrentTab } = commonStore;
  const { userFiles, handleUserFileCheckbox, clearUserFiles, loadUserFiles } =
    fileStore;

  useEffect(() => {
    setCurrentTab(Tab.Files);
    clearUserFiles();
    loadUserFiles();
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
      valueFormatter: (params) => getHumanReadableRelativeDate(params.value),
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
      valueFormatter: (params) => prettyBytes(params.value),
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <Box>
        <DataGrid
          className="DataGridDefault"
          rows={userFiles}
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
            handleUserFileCheckbox(items as string[])
          }
          slots={{
            toolbar: customToolbar,
            noRowsOverlay: NoRowsOverlay,
          }}
          slotProps={{
            columnsPanel: {
              disableHideAllButton: true,
              disableShowAllButton: true,
            },
          }}
          sx={{
            "--DataGrid-overlayHeight": "300px",
          }}
          autoHeight
        />
      </Box>
    </Box>
  );
};

export default observer(FilesGrid);
