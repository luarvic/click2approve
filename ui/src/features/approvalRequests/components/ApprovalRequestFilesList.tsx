import { UserFile } from "@/features/userFiles/models/userFile";
import { Dialogs } from "@/shared/constants/constants";
import { Close } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";

interface ApprovalRequestFilesListProps {
  existingFiles: UserFile[];
  newFiles: File[];
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}

const ApprovalRequestFilesList: React.FC<ApprovalRequestFilesListProps> = ({
  existingFiles,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
}) => {
  const hasFiles = existingFiles.length > 0 || newFiles.length > 0;
  if (!hasFiles) {
    return (
      <Typography color="text.secondary" sx={Dialogs.textBottomSpacingSx}>
        Add one or more files for review.
      </Typography>
    );
  }

  return (
    <List dense disablePadding sx={Dialogs.bottomSpacingSx}>
      {existingFiles.map((file, index) => (
        <ListItem
          key={`existing-${file.id}`}
          disableGutters
          secondaryAction={
            <Tooltip title="Remove file">
              <IconButton
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemoveExisting(index)}
              >
                <Close />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemText primary={file.name} secondary="From cloned request" />
        </ListItem>
      ))}
      {newFiles.map((file, index) => (
        <ListItem
          key={`${file.name}-${file.lastModified}-${index}`}
          disableGutters
          secondaryAction={
            <Tooltip title="Remove file">
              <IconButton
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemoveNew(index)}
              >
                <Close />
              </IconButton>
            </Tooltip>
          }
        >
          <ListItemText primary={file.name} secondary={file.type} />
        </ListItem>
      ))}
    </List>
  );
};

export default ApprovalRequestFilesList;
