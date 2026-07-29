import { stores } from "@/app/rootStore";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
} from "@/features/approvalRequests/models/approvalRequest";
import { UserFile } from "@/features/userFiles/models/userFile";
import {
  downloadApprovalRequestFile,
  downloadApprovalRequestTaskFile,
} from "@/features/userFiles/utils/downloaders";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/constants/constants";
import { Badge, Chip, Stack, Tooltip, type SxProps } from "@mui/material";
import type { BadgeProps } from "@mui/material/Badge";
import type { ChipProps } from "@mui/material/Chip";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestFilesBoxProps {
  requestFiles?: ApprovalRequestFile[];
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  compareWithPrevious?: boolean;
  showFileStateIndicators?: boolean;
}

const replacementChipSx: SxProps<Theme> = {
  marginLeft: (theme) => `-${theme.spacing(StackSpacing.default)}`,
  position: "relative",
  zIndex: 1,
};

const replacedOriginalChipSx: SxProps<Theme> = {
  opacity: 0.55,
};

const deletedFileChipSx: SxProps<Theme> = {
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

const ApprovalRequestFilesBox: React.FC<ApprovalRequestFilesBoxProps> = ({
  requestFiles,
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  compareWithPrevious = false,
  showFileStateIndicators = true,
}) => {
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const onDownload = tenantGlobalId && approvalRequestTaskGlobalId
    ? (userFile: UserFile) =>
      downloadApprovalRequestTaskFile(tenantGlobalId, userFile, approvalRequestTaskGlobalId)
    : tenantGlobalId && approvalRequestGlobalId
      ? (userFile: UserFile) =>
        downloadApprovalRequestFile(tenantGlobalId, userFile, approvalRequestGlobalId)
      : undefined;

  const files = requestFiles ?? [];
  const orderedFiles = [...files].sort((left, right) => left.sequence - right.sequence);
  const isPreviousFileForReplacement = (file: ApprovalRequestFile, index: number) =>
    file.revisionAction === ApprovalRequestFileRevisionAction.Removed &&
    orderedFiles[index + 1]?.revisionAction === ApprovalRequestFileRevisionAction.Replaced;

  const getReplacedOriginalFile = (replacementIndex: number) => {
    const previousFile = orderedFiles[replacementIndex - 1];
    return previousFile?.revisionAction === ApprovalRequestFileRevisionAction.Removed
      ? previousFile
      : undefined;
  };

  const renderChip = (
    userFile: UserFile,
    key: React.Key,
    color: ChipProps["color"] = "default",
    variant: ChipProps["variant"] = "filled",
    sx?: SxProps<Theme>,
    showBadge = false,
    badgeColor: BadgeProps["color"] = "default",
    tooltip?: string,
  ) => {
    const chip = showBadge ? (
      <Badge
        key={key}
        color={badgeColor}
        sx={fileBadgeSx}
        variant="dot"
      >
        <Chip
          color={color}
          label={userFile.name}
          onClick={onDownload ? () => onDownload(userFile) : undefined}
          sx={sx}
          variant={variant}
        />
      </Badge>
    ) : (
      <Chip
        key={key}
        color={color}
        label={userFile.name}
        onClick={onDownload ? () => onDownload(userFile) : undefined}
        sx={sx}
        variant={variant}
      />
    );

    return tooltip ? (
      <Tooltip key={key} title={tooltip}>
        {chip}
      </Tooltip>
    ) : chip;
  };

  const renderCurrentFile = (file: ApprovalRequestFile) =>
    renderChip(
      file.userFile,
      file.globalId,
      "default",
      undefined,
      undefined,
      showFileStateIndicators &&
        file.revisionAction === ApprovalRequestFileRevisionAction.Added
        ? true
        : false,
      "success",
      showFileStateIndicators &&
        file.revisionAction === ApprovalRequestFileRevisionAction.Added
        ? "New file"
        : undefined,
    );

  return (
    <CommentPaper>
      <Stack
        direction="row"
        flexWrap="wrap"
        sx={fileChipsSx}
      >
        {orderedFiles.map((file, index) => {
          if (!compareWithPrevious) {
            return file.revisionAction === ApprovalRequestFileRevisionAction.Removed
              ? null
              : renderCurrentFile(file);
          }

          if (file.revisionAction === ApprovalRequestFileRevisionAction.Removed) {
            if (isPreviousFileForReplacement(file, index)) {
              return null;
            }

            return renderChip(
              file.previousUserFile ?? file.userFile,
              file.globalId,
              "default",
              undefined,
              showFileStateIndicators ? deletedFileChipSx : undefined,
              showFileStateIndicators,
              "error",
              showFileStateIndicators ? "Deleted file" : undefined,
            );
          }

          if (file.revisionAction === ApprovalRequestFileRevisionAction.Replaced) {
            const previousRequestFile = getReplacedOriginalFile(index);

            return (
              <Stack
                key={file.globalId}
                direction="row"
                spacing={StackSpacing.none}
                alignItems="center"
              >
                {(previousRequestFile?.userFile ?? file.previousUserFile) &&
                  renderChip(
                    previousRequestFile?.userFile ?? file.previousUserFile!,
                    `${file.globalId}-previous`,
                    "default",
                    undefined,
                    showFileStateIndicators ? replacedOriginalChipSx : undefined,
                    false,
                    "default",
                    showFileStateIndicators ? "Replaced file" : undefined,
                  )}
                {renderChip(
                  file.userFile,
                  `${file.globalId}-current`,
                  "default",
                  undefined,
                  replacementChipSx,
                  false,
                  "default",
                  showFileStateIndicators ? "Replacement file" : undefined,
                )}
              </Stack>
            );
          }

          return renderCurrentFile(file);
        })}
      </Stack>
    </CommentPaper>
  );
};

export default ApprovalRequestFilesBox;
