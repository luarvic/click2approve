import { Box } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { ApprovalRequestStatuses } from "../models/ApprovalRequestStatuses";
import { ApprovalRequestTypes } from "../models/ApprovalRequestTypes";
import { IApprover } from "../models/Approver";
import { IUserFile } from "../models/UserFile";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { getHumanReadableRelativeDate } from "../utils/Converters";

// Data grid with sent approval requests.
export const Sent = () => {
  const { approvalRequests, loadApprovalRequests } = approvalRequestStore;

  useEffect(() => {
    loadApprovalRequests(ApprovalRequestTypes.Sent);
  }, []);

  const columns: GridColDef[] = [
    {
      field: "sentDate",
      headerName: "Sent",
      flex: 1,
      valueFormatter: (params) => getHumanReadableRelativeDate(params.value),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueFormatter: (params) => ApprovalRequestStatuses[params.value],
    },
    {
      field: "approveByDate",
      headerName: "By",
      flex: 1,
    },
    {
      field: "approvers",
      headerName: "Who",
      flex: 1,
      valueFormatter: (params) =>
        params.value.map((approver: IApprover) => approver.email).join(", "),
    },
    {
      field: "userFiles",
      headerName: "Files",
      flex: 1,
      valueFormatter: (params) =>
        params.value.map((approver: IUserFile) => approver.name).join(", "),
    },
    {
      field: "comment",
      headerName: "Comment",
      flex: 1,
    },
  ];

  return (
    <Box sx={{ width: "100%", overflow: "hidden", pr: 2 }}>
      <DataGrid
        className="DataGridDefault"
        rows={approvalRequests}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default observer(Sent);
