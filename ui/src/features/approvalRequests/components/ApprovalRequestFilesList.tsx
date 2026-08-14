import { UserFile } from "@/features/userFiles/models/userFile";
import FileTypeIcon from "@/shared/components/icons/FileTypeIcon";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/constants/constants";
import { Close, MoreVert, Undo } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Link,
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
  onRemoveExisting?: (index: number) => void;
  onRemoveNew: (index: number) => void;
  onRemoveReplacement?: (index: number) => void;
  onDownloadExisting?: (file: UserFile) => void;
  linkSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  onRestoreExisting?: (index: number) => void;
  onReplaceExisting?: (index: number) => void;
}

const replacedOriginalFileLinkSx: SxProps<Theme> = {
  opacity: 0.55,
};

const replacedFilesGroupSx: SxProps<Theme> = {
  borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
  paddingLeft: (theme) => theme.spacing(StackSpacing.default),
};

const fileLinkSx: SxProps<Theme> = {
  alignItems: "center",
  columnGap: StackSpacing.default,
  display: "inline-flex",
  textAlign: "left",
};

const fileRowSx: SxProps<Theme> = {
  minHeight: 24,
};

const ApprovalRequestFilesList: React.FC<ApprovalRequestFilesListProps> = ({
  existingFiles,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
  onRemoveReplacement,
  onDownloadExisting,
  linkSx,
  sx,
  onRestoreExisting,
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
      onRemoveExisting?.(menuFileIndex);
    }
    closeMenu();
  };

  const renderFileLink = (
    fileName: string,
    sx?: SxProps<Theme>,
    onClick?: () => void,
  ) => (
    <Link
      component={onClick ? "button" : "span"}
      onClick={onClick}
      sx={[
        fileLinkSx,
        ...(Array.isArray(linkSx) ? linkSx : [linkSx]),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      variant="body2"
    >
      <FileTypeIcon fontSize="small" fileName={fileName} />
      {fileName}
    </Link>
  );

  const renderNewFile = (file: File, index: number) => {
    const fileEntry = (
      <Stack direction="row" alignItems="center">
        {renderFileLink(file.name)}
        <IconButton
          aria-label={`Remove ${file.name}`}
          onClick={() => onRemoveNew(index)}
          size="small"
        >
          <Close fontSize="small" />
        </IconButton>
      </Stack>
    );

    return onReplaceExisting ? (
      <Tooltip
        key={`${file.name}-${file.lastModified}-${index}`}
        title="New file"
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={StackSpacing.default}
          sx={fileRowSx}
        >
          {fileEntry}
          <Chip color="success" label="Added" size="small" variant="outlined" />
        </Stack>
      </Tooltip>
    ) : (
      <Stack
        key={`${file.name}-${file.lastModified}-${index}`}
        direction="row"
        alignItems="center"
      >
        {fileEntry}
      </Stack>
    );
  };

  return (
    <CommentPaper sx={sx}>
      <Stack alignItems="flex-start" spacing={StackSpacing.default}>
        {existingFiles.map((file, index) => (
          <Stack
            key={`existing-${file.requestFileGlobalId ?? file.file.globalId}`}
            direction="row"
            spacing={StackSpacing.tight}
            alignItems="center"
            sx={fileRowSx}
          >
            {onReplaceExisting ? (
              <>
                {file.removed ? (
                  <Tooltip title="Deleted file">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={StackSpacing.default}
                    >
                      {renderFileLink(file.file.name, replacedOriginalFileLinkSx)}
                      <Chip color="error" label="Deleted" size="small" variant="outlined" />
                      <IconButton
                        aria-label={`Restore ${file.file.name}`}
                        onClick={() => onRestoreExisting?.(index)}
                        size="small"
                      >
                        <Undo fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Tooltip>
                ) : file.replacement ? (
                  <Stack alignItems="flex-start" spacing={StackSpacing.default}>
                    <Tooltip title="Replacement file">
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={StackSpacing.default}
                      >
                        {renderFileLink(file.replacement.name)}
                        <Chip
                          color="warning"
                          label="Replacement"
                          size="small"
                          variant="outlined"
                        />
                        <IconButton
                          aria-label={`Remove ${file.replacement.name}`}
                          onClick={() => onRemoveReplacement?.(index)}
                          size="small"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Tooltip>
                    <Box sx={replacedFilesGroupSx}>
                      <Tooltip title="Replaced file">
                        {renderFileLink(
                          file.file.name,
                          replacedOriginalFileLinkSx,
                        )}
                      </Tooltip>
                    </Box>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center">
                    {renderFileLink(file.file.name)}
                    <IconButton
                      aria-label={`Actions for ${file.file.name}`}
                      onClick={(event) => openMenu(event.currentTarget, index)}
                      size="small"
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </>
            ) : (
              <Stack direction="row" alignItems="center">
                {renderFileLink(
                  file.file.name,
                  undefined,
                  onDownloadExisting
                    ? () => onDownloadExisting(file.file)
                    : undefined,
                )}
                {onRemoveExisting && (
                  <IconButton
                    aria-label={`Remove ${file.file.name}`}
                    onClick={() => onRemoveExisting(index)}
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            )}
          </Stack>
        ))}
        {newFiles.map(renderNewFile)}
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
