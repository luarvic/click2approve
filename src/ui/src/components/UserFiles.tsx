import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { DefaultExtensionType, FileIcon, defaultStyles } from "react-file-icon";

import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import prettyBytes from "pretty-bytes";
import { IUserFile } from "../models/UserFile";
import { userFileStore } from "../stores/UserFileStore";
import { downloadFileBase64 } from "../utils/ApiClient";
import Buttons from "./Buttons";

// Table with user files.
export const UserFiles = () => {
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

  const loadData = () => {
    loadUserFiles();
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadClick = async (userFile: IUserFile) => {
    const base64String = await downloadFileBase64(userFile.id);
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", userFile.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getHumanReadableRelativeDate = (absoluteDate: Date): string => {
    const ago = require("s-ago");
    return ago(absoluteDate);
  };

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
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <Box>
        <Buttons />
      </Box>
      <Box>
        <DataGrid
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
  );
};

export default observer(UserFiles);
