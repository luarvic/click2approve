import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { commonStore } from "../../stores/commonStore";
import { fileStore } from "../../stores/fileStore";
import ApprovalRequestSubmitDialog from "../dialogs/ApprovalRequestSubmitDialog";

const ButtonSend = () => {
  const { getSelectedUserFiles } = fileStore;
  const { setApprovalRequestSubmitDialogIsOpen } = commonStore;

  return (
    <>
      <Button
        size="small"
        variant="text"
        startIcon={<Send />}
        onClick={() => setApprovalRequestSubmitDialogIsOpen(true)}
        disabled={getSelectedUserFiles().length > 0 ? false : true}
      >
        Send
      </Button>
      <ApprovalRequestSubmitDialog />
    </>
  );
};

export default observer(ButtonSend);
