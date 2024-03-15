import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { fileStore } from "../../stores/FileStore";
import DialogApprovalRequestSubmit from "../dialogs/DialogApprovalRequestSubmit";
import { commonStore } from "../../stores/CommonStore";

const GridToolbarSendButton = () => {
  const { getSelectedUserFiles } = fileStore;
  const { setApprovalRequestSubmitDialogIsOpen } = commonStore;

  return (
    <Fragment>
      <Button
        size="small"
        variant="text"
        startIcon={<Send />}
        onClick={() => setApprovalRequestSubmitDialogIsOpen(true)}
        disabled={getSelectedUserFiles().length > 0 ? false : true}
      >
        Send
      </Button>
      <DialogApprovalRequestSubmit />
    </Fragment>
  );
};

export default observer(GridToolbarSendButton);
