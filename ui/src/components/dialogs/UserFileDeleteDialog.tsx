import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { fileDelete } from "../../lib/controllers/userFile";
import { stores } from "../../stores/stores";
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
          if (stores.userFileStore.currentUserFile) {
            const didDelete = await fileDelete(
              stores.userFileStore.currentUserFile.id
            );
            if (didDelete) {
              stores.commonStore.setUserFileDeleteDialogIsOpen(false);
              stores.userFileStore.clearUserFiles();
              stores.userFileStore.loadUserFiles();
            }
          } else {
            stores.commonStore.setUserFileDeleteDialogIsOpen(false);
          }
        },
      }}
    >
      <DialogTitle>Delete file</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Are you sure you want to delete the following file together with all
          related approval requests? This cannot be undone.
        </DialogContentText>
        {stores.userFileStore.currentUserFile && (
          <UserFilesList
            userFiles={[stores.userFileStore.currentUserFile]}
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
