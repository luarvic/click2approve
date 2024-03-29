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
import { Tab } from "../../models/Tab";
import { IUserFile } from "../../models/UserFile";
import { commonStore } from "../../stores/CommonStore";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/Constants";
import { fileStore } from "../../stores/FileStore";
import { getHumanReadableRelativeDate } from "../../utils/Converters";
import { downloadUserFile } from "../../utils/Downloaders";
import Tabs from "../Tabs";
import GridToolbarSendButton from "./GridToolbarSendButton";
import GridToolbarUploadButton from "./GridToolbarUploadButton";

// Data grid with user files.
const GridFiles = () => {
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
        <GridToolbarUploadButton />
        <GridToolbarSendButton />
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
    <Box sx={{ display: "flex", pt: 2 }}>
      <Tabs />
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
            }}
            slotProps={{
              columnsPanel: {
                disableHideAllButton: true,
                disableShowAllButton: true,
              },
            }}
            autoHeight
          />
        </Box>
      </Box>
    </Box>
  );
};

export default observer(GridFiles);
