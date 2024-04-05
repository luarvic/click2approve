import { Send } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/stores";

const SendButton = () => {
  return (
    <Button
      size="small"
      variant="text"
      startIcon={<Send />}
      onClick={() =>
        stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true)
      }
      disabled={
        stores.fileStore.getSelectedUserFiles().length > 0 ? false : true
      }
    >
      Send
    </Button>
  );
};

export default observer(SendButton);
