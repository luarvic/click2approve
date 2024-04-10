import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/stores";
import { fileDelete } from "../../utils/apiClient";
import UserFilesList from "../lists/UserFilesList";

const UserFileDeleteDialog = () => {
  const handleClose = () => {
    stores.commonStore.setUserFileDeleteDialogIsOpen(false);
  };

  return (
    <Dialog
      open={stores.commonStore.userFileDeleteDialogIsOpen}
      onClose={handleClose}
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          stores.commonStore.setUserFileDeleteDialogIsOpen(false);
          stores.fileStore.currentUserFile &&
            (await fileDelete(stores.fileStore.currentUserFile.id));
          stores.fileStore.clearUserFiles();
          stores.fileStore.loadUserFiles();
        },
      }}
    >
      <DialogTitle>Delete file</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Are you sure you want to delete the following file together with all
          related approval requests? This cannot be undone.
        </DialogContentText>
        {stores.fileStore.currentUserFile && (
          <UserFilesList
            userFiles={[stores.fileStore.currentUserFile]}
            direction="column"
            sx={{ my: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(UserFileDeleteDialog);
