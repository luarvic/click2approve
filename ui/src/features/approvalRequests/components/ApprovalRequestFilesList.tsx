import { UserFile } from "@/features/userFiles/models/userFile";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Close } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
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
    return null;
  }

  return (
    <CommentPaper>
      <List dense disablePadding>
        {existingFiles.map((file, index) => (
          <ListItem
            key={`existing-${file.id}`}
            disableGutters
            secondaryAction={
              <Tooltip title="Remove file">
                <IconButton
                  aria-label={`Remove ${file.name}`}
                  color="error"
                  onClick={() => onRemoveExisting(index)}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText primary={file.name} />
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
                  color="error"
                  onClick={() => onRemoveNew(index)}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText primary={file.name} />
          </ListItem>
        ))}
      </List>
    </CommentPaper>
  );
};

export default ApprovalRequestFilesList;
