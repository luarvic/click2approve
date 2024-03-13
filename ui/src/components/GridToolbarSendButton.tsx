import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { userFileStore } from "../stores/UserFileStore";
import SendDialog from "./ApprovalRequestSubmitDialog";

const GridToolbarSendButton = () => {
  const { getSelectedUserFiles } = userFileStore;
  const { setApprovalRequestSubmitDialogIsOpen } = approvalRequestStore;

  return (
    <Fragment>
      <Button
        size="small"
        variant="text"
        color="secondary"
        startIcon={<Send />}
        onClick={() => setApprovalRequestSubmitDialogIsOpen(true)}
        disabled={getSelectedUserFiles().length > 0 ? false : true}
      >
        Send
      </Button>
      <SendDialog />
    </Fragment>
  );
};

export default observer(GridToolbarSendButton);
