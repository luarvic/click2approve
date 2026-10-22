import { ApprovalRequestFileStyles } from "@/features/approvalRequests/components/approvalRequestFileStyles";
import { UserFile } from "@/features/userFiles/models/userFile";
import FileNameLink from "@/shared/components/files/FileNameLink";
import FileRow from "@/shared/components/files/FileRow";
import ReplacedFileGroup from "@/shared/components/files/ReplacedFileGroup";
import { Flex } from "@/shared/components/layout/flexStyles";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/theme/tokens";
import { Close, MoreVert, Undo } from "@mui/icons-material";
import type { TypographyProps } from "@mui/material";
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
  linkVariant?: TypographyProps["variant"];
  sx?: SxProps<Theme>;
  onRestoreExisting?: (index: number) => void;
  onReplaceExisting?: (index: number) => void;
}

const fileActionButtonSx: SxProps<Theme> = {
  p: 0,
};

const fileActionRowSx: SxProps<Theme> = {
  alignItems: "center",
  columnGap: StackSpacing.tight,
};

const compactActionsSx = { columnGap: StackSpacing.tight } as const;

const ApprovalRequestFilesList: React.FC<ApprovalRequestFilesListProps> = ({
  existingFiles,
  isActionsDisabled = false,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
  onRemoveReplacement,
  onDownloadExisting,
  linkSx,
  linkVariant,
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
      variant={linkVariant}
    />
  );

  const renderNewFile = (file: UserFile, index: number) => {
    const fileEntry = (
      <Stack direction="row" sx={fileActionRowSx}>
        {renderFileLink(file.name)}
        <IconButton
          aria-label={`Remove ${file.name}`}
          disabled={isActionsDisabled}
          onClick={() => onRemoveNew(index)}
          size="small"
          sx={fileActionButtonSx}
        >
          <Close fontSize="small" />
        </IconButton>
      </Stack>
    );

    return onReplaceExisting ? (
      <Tooltip key={file.globalId} title="New file">
        <FileRow sx={ApprovalRequestFileStyles.actionsSx}>
          {fileEntry}
          <Chip color="success" label="Added" size="small" variant="outlined" />
        </FileRow>
      </Tooltip>
    ) : (
      <Stack key={file.globalId} direction="row" sx={Flex.alignCenterSx}>
        {fileEntry}
      </Stack>
    );
  };

  return (
    <CommentPaper sx={sx}>
      <Stack spacing={StackSpacing.default} sx={Flex.alignStartSx}>
        {existingFiles.map((file, index) => (
          <FileRow key={`existing-${file.requestFileGlobalId ?? file.file.globalId}`} sx={compactActionsSx}>
            {onReplaceExisting ? (
              <>
                {file.removed ? (
                  <Tooltip title="Deleted file">
                    <Stack direction="row" spacing={StackSpacing.default} sx={Flex.alignCenterSx}>
                      {renderFileLink(file.file.name, ApprovalRequestFileStyles.inactiveLinkSx)}
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
                  <Stack spacing={StackSpacing.default} sx={Flex.alignStartSx}>
                    <Tooltip title="Replacement file">
                      <Stack direction="row" spacing={StackSpacing.default} sx={Flex.alignCenterSx}>
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
                        {renderFileLink(file.file.name, ApprovalRequestFileStyles.inactiveLinkSx)}
                      </Tooltip>
                    </ReplacedFileGroup>
                  </Stack>
                ) : (
                  <Stack direction="row" sx={Flex.alignCenterSx}>
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
              <Stack direction="row" sx={fileActionRowSx}>
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
                    sx={fileActionButtonSx}
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
