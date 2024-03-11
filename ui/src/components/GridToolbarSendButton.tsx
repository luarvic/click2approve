import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Fragment } from "react";
import { commonStore } from "../stores/CommonStore";
import { userFileStore } from "../stores/UserFileStore";
import SendDialog from "./SendDialog";

const GridToolbarSendButton = () => {
  const { getSelectedUserFiles } = userFileStore;
  const { setSendDialogOpen } = commonStore;

  return (
    <Fragment>
      <Button
        size="small"
        variant="text"
        startIcon={<Send />}
        onClick={() => setSendDialogOpen(true)}
        disabled={getSelectedUserFiles().length > 0 ? false : true}
      >
        Send
      </Button>
      <SendDialog />
    </Fragment>
  );
};

export default observer(GridToolbarSendButton);
