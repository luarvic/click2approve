import { UserFile } from "@/features/userFiles/models/userFile";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/constants/constants";
import { MoreVert } from "@mui/icons-material";
import {
  Badge,
  Chip,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

export interface RevisionExistingFile {
  file: UserFile;
  requestFileGlobalId?: string;
  removed?: boolean;
  replacement?: File;
}

interface ApprovalRequestFilesListProps {
  existingFiles: RevisionExistingFile[];
  newFiles: File[];
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
  onRemoveReplacement?: (index: number) => void;
  onReplaceExisting?: (index: number) => void;
}

const replacementChipSx: SxProps<Theme> = {
  marginLeft: (theme) => `-${theme.spacing(StackSpacing.default)}`,
  position: "relative",
  zIndex: 1,
};

const replacedOriginalChipSx: SxProps<Theme> = {
  opacity: 0.55,
};

const fileBadgeSx: SxProps<Theme> = {
  "& .MuiBadge-badge": {
    top: 1,
  },
};

const fileChipsSx: SxProps<Theme> = {
  columnGap: StackSpacing.default,
  rowGap: StackSpacing.default,
};

const ApprovalRequestFilesList: React.FC<ApprovalRequestFilesListProps> = ({
  existingFiles,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
  onRemoveReplacement,
  onReplaceExisting,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuFileIndex, setMenuFileIndex] = useState<number | null>(null);
  const hasFiles = existingFiles.length > 0 || newFiles.length > 0;
  if (!hasFiles) {
    return null;
  }

  const openMenu = (anchor: HTMLElement, index: number) => {
    setMenuAnchor(anchor);
    setMenuFileIndex(index);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuFileIndex(null);
  };

  const replaceMenuFile = () => {
    if (menuFileIndex !== null) {
      onReplaceExisting?.(menuFileIndex);
    }
    closeMenu();
  };

  const removeMenuFile = () => {
    if (menuFileIndex !== null) {
      onRemoveExisting(menuFileIndex);
    }
    closeMenu();
  };

  const renderNewFileChip = (file: File, index: number) => {
    const chip = (
      <Chip
        label={file.name}
        onDelete={() => onRemoveNew(index)}
      />
    );

    return onReplaceExisting ? (
      <Tooltip
        key={`${file.name}-${file.lastModified}-${index}`}
        title="New file"
      >
        <Badge
          color="success"
          sx={fileBadgeSx}
          variant="dot"
        >
          {chip}
        </Badge>
      </Tooltip>
    ) : (
      <Chip
        key={`${file.name}-${file.lastModified}-${index}`}
        label={file.name}
        onDelete={() => onRemoveNew(index)}
      />
    );
  };

  return (
    <CommentPaper>
      <Stack
        direction="row"
        flexWrap="wrap"
        sx={fileChipsSx}
      >
        {existingFiles.map((file, index) => (
          <Stack
            key={`existing-${file.requestFileGlobalId ?? file.file.globalId}`}
            direction="row"
            spacing={file.replacement ? StackSpacing.none : StackSpacing.tight}
            alignItems="center"
          >
            {onReplaceExisting ? (
              <>
                {file.replacement ? (
                  <>
                    <Tooltip title="Replaced file">
                      <Chip
                        label={file.file.name}
                        sx={replacedOriginalChipSx}
                      />
                    </Tooltip>
                    <Tooltip title="Replacement file">
                      <Chip
                        label={file.replacement.name}
                        onDelete={() => onRemoveReplacement?.(index)}
                        sx={replacementChipSx}
                      />
                    </Tooltip>
                  </>
                ) : (
                  <Chip
                    deleteIcon={<MoreVert />}
                    label={file.file.name}
                    onDelete={(event) => openMenu(event.currentTarget, index)}
                  />
                )}
              </>
            ) : (
              <Chip
                label={file.file.name}
                onDelete={() => onRemoveExisting(index)}
              />
            )}
          </Stack>
        ))}
        {newFiles.map(renderNewFileChip)}
      </Stack>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={removeMenuFile}>Delete</MenuItem>
        <MenuItem onClick={replaceMenuFile}>Replace</MenuItem>
      </Menu>
    </CommentPaper>
  );
};

export default ApprovalRequestFilesList;
