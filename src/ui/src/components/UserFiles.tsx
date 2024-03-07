import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import prettyBytes from "pretty-bytes";
import { useEffect } from "react";
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon";
import { userFileStore } from "../stores/UserFileStore";
import { getHumanReadableRelativeDate } from "../utils/Converters";
import Buttons from "./Buttons";
import Tabs from "./Tabs";
import { userAccountStore } from "../stores/UserAccountStore";

// Data grid with user files.
const UserFiles = () => {
  const { currentUser } = userAccountStore;
  const { userFiles, loadUserFiles, handleUserFileCheckbox } = userFileStore;

  const getDefaultExtensionType = (extension?: string) => {
    if (!extension) {
      return undefined;
    }
    const styledIcons = Object.keys(
      defaultStyles
    ) as Array<DefaultExtensionType>;
    return styledIcons.find(
      (key) => key.toString() === extension.replace(".", "").toLowerCase()
    );
  };

  useEffect(() => {
    loadUserFiles();
  }, []);

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 70,
      renderCell: (params: GridRenderCellParams<any, string>) => (
        <div className="fileicon">
          {getDefaultExtensionType(params.value) ? (
            <FileIcon
              extension={params.value}
              {...defaultStyles[getDefaultExtensionType(params.value)!]}
            />
          ) : (
            params.value
          )}
        </div>
      ),
    },
    { field: "name", headerName: "Name", flex: 3 },
    {
      field: "createdDate",
      headerName: "Created",
      flex: 2,
      valueFormatter: (params) => getHumanReadableRelativeDate(params.value),
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
          <Buttons />
        </Box>
        <Box>
          <DataGrid
            className="DataGridDefault"
            rows={userFiles}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(items) =>
              handleUserFileCheckbox(items as string[])
            }
          />
        </Box>
      </Box>
    </Box>
  );
};

export default observer(UserFiles);
