import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Box, LinearProgress, Tooltip } from "@mui/material";
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
import { useEffect } from "react";
import { ApprovalStatus } from "../../models/approvalStatus";
import { Tab } from "../../models/tab";
import { IUserFile } from "../../models/userFile";
import { stores } from "../../stores/Stores";
import { DATA_GRID_DEFAULT_PAGE_SIZE } from "../../stores/constantsStore";
import {
  getHumanReadableRelativeDate,
  getLocaleDateTimeString,
} from "../../utils/converters";
import ApprovalRequestDeleteDialog from "../dialogs/ApprovalRequestDeleteDialog";
import ApprovalRequestViewDialog from "../dialogs/ApprovalRequestViewDialog";
import { ApproversList } from "../lists/ApproversList";
import { UserFilesList } from "../lists/UserFilesList";
import { ApprovalRequestActionsMenu } from "../menus/ApprovalRequestActionsMenu";
import NoRowsOverlay from "../overlays/NoRowsOverlay";

const SentGrid = () => {
  useEffect(() => {
    stores.commonStore.setCurrentTab(Tab.Sent);
    stores.approvalRequestStore.clearApprovalRequests();
    stores.approvalRequestStore.loadApprovalRequests();
  }, []);

  const customToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  };

  const renderStatus = (status: ApprovalStatus) => {
    switch (status) {
      case 0:
        return <Loop />;
      case 1:
        return <Check />;
      case 2:
        return <Close />;
      default:
        return <QuestionMark />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: "submittedDate",
      headerName: "Submitted",
      flex: 2,
      valueFormatter: (value) => getHumanReadableRelativeDate(value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        return (
          <Tooltip title={ApprovalStatus[params.row.status]}>
            {renderStatus(params.row.status)}
          </Tooltip>
        );
      },
      valueGetter: (_value, row) => ApprovalStatus[row.status],
    },
    {
      field: "approveByDate",
      headerName: "Review by",
      flex: 3,
      valueFormatter: (value) =>
        value && getLocaleDateTimeString(value as Date),
    },
    {
      field: "approvers",
      headerName: "Approvers",
      flex: 5,
      valueGetter: (value: string[]) =>
        value.map((approver) => approver.toLowerCase()).join(", "),
      renderCell: (params) => {
        return <ApproversList approvers={params.row.approvers} />;
      },
    },
    {
      field: "userFiles",
      headerName: "Files",
      flex: 5,
      valueGetter: (value: IUserFile[]) =>
        value.map((userFile) => userFile.name).join(", "),
      renderCell: (params) => {
        return <UserFilesList userFiles={params.row.userFiles} />;
      },
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        return <ApprovalRequestActionsMenu approvalRequest={params.row} />;
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        rows={stores.approvalRequestStore.approvalRequests}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: DATA_GRID_DEFAULT_PAGE_SIZE,
            },
          },
        }}
        pageSizeOptions={[DATA_GRID_DEFAULT_PAGE_SIZE]}
        disableRowSelectionOnClick
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
          stores.commonStore.isLoading("get_api/request/list") ||
          stores.commonStore.isLoading("delete_api/request")
        }
      />
      <ApprovalRequestViewDialog />
      <ApprovalRequestDeleteDialog />
    </Box>
  );
};

export default observer(SentGrid);
