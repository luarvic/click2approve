import { UserFile } from "@/features/userFiles/models/userFile";
import FileNameLink from "@/shared/components/files/FileNameLink";
import FileRow from "@/shared/components/files/FileRow";
import ReplacedFileGroup from "@/shared/components/files/ReplacedFileGroup";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/constants/constants";
import { Close, MoreVert, Undo } from "@mui/icons-material";
import { Chip, IconButton, Menu, MenuItem, Stack, Tooltip, type SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";

export interface RevisionExistingFile {
  file: UserFile;
  requestFileGlobalId?: string;
  removed?: boolean;
  replacement?: UserFile;
}

interface ApprovalRequestFilesListProps {
  existingFiles: RevisionExistingFile[];
  isActionsDisabled?: boolean;
  newFiles: UserFile[];
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

const ApprovalRequestFilesList: React.FC<ApprovalRequestFilesListProps> = ({
  existingFiles,
  isActionsDisabled = false,
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

  const renderFileLink = (fileName: string, sx?: SxProps<Theme>, onClick?: () => void) => (
    <FileNameLink
      fileName={fileName}
      onClick={onClick}
      sx={[...(Array.isArray(linkSx) ? linkSx : [linkSx]), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );

  const renderNewFile = (file: UserFile, index: number) => {
    const fileEntry = (
      <Stack direction="row" alignItems="center">
        {renderFileLink(file.name)}
        <IconButton
          aria-label={`Remove ${file.name}`}
          disabled={isActionsDisabled}
          onClick={() => onRemoveNew(index)}
          size="small"
        >
          <Close fontSize="small" />
        </IconButton>
      </Stack>
    );

    return onReplaceExisting ? (
      <Tooltip key={file.globalId} title="New file">
        <FileRow sx={{ columnGap: StackSpacing.default }}>
          {fileEntry}
          <Chip color="success" label="Added" size="small" variant="outlined" />
        </FileRow>
      </Tooltip>
    ) : (
      <Stack key={file.globalId} direction="row" alignItems="center">
        {fileEntry}
      </Stack>
    );
  };

  return (
    <CommentPaper sx={sx}>
      <Stack alignItems="flex-start" spacing={StackSpacing.default}>
        {existingFiles.map((file, index) => (
          <FileRow
            key={`existing-${file.requestFileGlobalId ?? file.file.globalId}`}
            sx={{ columnGap: StackSpacing.tight }}
          >
            {onReplaceExisting ? (
              <>
                {file.removed ? (
                  <Tooltip title="Deleted file">
                    <Stack direction="row" alignItems="center" spacing={StackSpacing.default}>
                      {renderFileLink(file.file.name, replacedOriginalFileLinkSx)}
                      <Chip color="error" label="Deleted" size="small" variant="outlined" />
                      <IconButton
                        aria-label={`Restore ${file.file.name}`}
                        disabled={isActionsDisabled}
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
                      <Stack direction="row" alignItems="center" spacing={StackSpacing.default}>
                        {renderFileLink(file.replacement.name)}
                        <Chip color="warning" label="Replacement" size="small" variant="outlined" />
                        <IconButton
                          aria-label={`Remove ${file.replacement.name}`}
                          disabled={isActionsDisabled}
                          onClick={() => onRemoveReplacement?.(index)}
                          size="small"
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Tooltip>
                    <ReplacedFileGroup>
                      <Tooltip title="Replaced file">
                        {renderFileLink(file.file.name, replacedOriginalFileLinkSx)}
                      </Tooltip>
                    </ReplacedFileGroup>
                  </Stack>
                ) : (
                  <Stack direction="row" alignItems="center">
                    {renderFileLink(file.file.name)}
                    <IconButton
                      aria-label={`Actions for ${file.file.name}`}
                      disabled={isActionsDisabled}
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
                  onDownloadExisting ? () => onDownloadExisting(file.file) : undefined,
                )}
                {onRemoveExisting && (
                  <IconButton
                    aria-label={`Remove ${file.file.name}`}
                    disabled={isActionsDisabled}
                    onClick={() => onRemoveExisting(index)}
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            )}
          </FileRow>
        ))}
        {newFiles.map(renderNewFile)}
      </Stack>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem disabled={isActionsDisabled} onClick={removeMenuFile}>
          Delete
        </MenuItem>
        <MenuItem disabled={isActionsDisabled} onClick={replaceMenuFile}>
          Replace
        </MenuItem>
      </Menu>
    </CommentPaper>
  );
};

export default ApprovalRequestFilesList;
