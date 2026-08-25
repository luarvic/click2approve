import { stores } from "@/app/rootStore";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
} from "@/features/approvalRequests/models/approvalRequest";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestFile, downloadApprovalRequestTaskFile } from "@/features/userFiles/utils/downloaders";
import FileNameLink from "@/shared/components/files/FileNameLink";
import FileRow from "@/shared/components/files/FileRow";
import ReplacedFileGroup from "@/shared/components/files/ReplacedFileGroup";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { StackSpacing } from "@/shared/constants/constants";
import { Chip, Stack, Tooltip, type SxProps } from "@mui/material";
import type { ChipProps } from "@mui/material/Chip";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestFilesBoxProps {
  requestFiles?: ApprovalRequestFile[];
  approvalRequestGlobalId?: string;
  approvalRequestTaskGlobalId?: string;
  compareWithPrevious?: boolean;
  showFileStateIndicators?: boolean;
}

const replacedOriginalFileLinkSx: SxProps<Theme> = {
  opacity: 0.55,
};

const deletedFileLinkSx: SxProps<Theme> = {
  opacity: 0.55,
};

const ApprovalRequestFilesBox: React.FC<ApprovalRequestFilesBoxProps> = ({
  requestFiles,
  approvalRequestGlobalId,
  approvalRequestTaskGlobalId,
  compareWithPrevious = false,
  showFileStateIndicators = true,
}) => {
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const onDownload =
    tenantGlobalId && approvalRequestTaskGlobalId
      ? (userFile: UserFile) => downloadApprovalRequestTaskFile(tenantGlobalId, userFile, approvalRequestTaskGlobalId)
      : tenantGlobalId && approvalRequestGlobalId
        ? (userFile: UserFile) => downloadApprovalRequestFile(tenantGlobalId, userFile, approvalRequestGlobalId)
        : undefined;

  const files = requestFiles ?? [];
  const orderedFiles = [...files].sort((left, right) => left.sequence - right.sequence);
  const isPreviousFileForReplacement = (file: ApprovalRequestFile, index: number) =>
    file.revisionAction === ApprovalRequestFileRevisionAction.Removed &&
    orderedFiles[index + 1]?.revisionAction === ApprovalRequestFileRevisionAction.Replaced;

  const getReplacedOriginalFile = (replacementIndex: number) => {
    const previousFile = orderedFiles[replacementIndex - 1];
    return previousFile?.revisionAction === ApprovalRequestFileRevisionAction.Removed ? previousFile : undefined;
  };

  const renderFileLink = (
    userFile: UserFile,
    key: React.Key,
    sx?: SxProps<Theme>,
    statusColor: ChipProps["color"] = "default",
    statusLabel?: string,
    tooltip?: string,
  ) => {
    const fileLink = (
      <FileRow key={key} sx={{ columnGap: StackSpacing.default }}>
        <FileNameLink
          fileName={userFile.name}
          onClick={onDownload ? () => onDownload(userFile) : undefined}
          sx={sx}
          variant="body1"
        />
        {statusLabel && <Chip color={statusColor} label={statusLabel} size="small" variant="outlined" />}
      </FileRow>
    );

    return tooltip ? (
      <Tooltip key={key} title={tooltip}>
        {fileLink}
      </Tooltip>
    ) : (
      fileLink
    );
  };

  const renderCurrentFile = (file: ApprovalRequestFile) =>
    renderFileLink(
      file.userFile,
      file.globalId,
      undefined,
      "success",
      showFileStateIndicators && file.revisionAction === ApprovalRequestFileRevisionAction.Added ? "Added" : undefined,
      showFileStateIndicators && file.revisionAction === ApprovalRequestFileRevisionAction.Added
        ? "New file"
        : undefined,
    );

  return (
    <CommentPaper>
      <Stack alignItems="flex-start" spacing={StackSpacing.default}>
        {orderedFiles.map((file, index) => {
          if (!compareWithPrevious) {
            return file.revisionAction === ApprovalRequestFileRevisionAction.Removed ? null : renderCurrentFile(file);
          }

          if (file.revisionAction === ApprovalRequestFileRevisionAction.Removed) {
            if (isPreviousFileForReplacement(file, index)) {
              return null;
            }

            return renderFileLink(
              file.previousUserFile ?? file.userFile,
              file.globalId,
              showFileStateIndicators ? deletedFileLinkSx : undefined,
              "error",
              showFileStateIndicators ? "Deleted" : undefined,
              showFileStateIndicators ? "Deleted file" : undefined,
            );
          }

          if (file.revisionAction === ApprovalRequestFileRevisionAction.Replaced) {
            const previousRequestFile = getReplacedOriginalFile(index);

            return (
              <Stack key={file.globalId} alignItems="flex-start" spacing={StackSpacing.default}>
                {renderFileLink(
                  file.userFile,
                  `${file.globalId}-current`,
                  undefined,
                  "warning",
                  "Replacement",
                  showFileStateIndicators ? "Replacement file" : undefined,
                )}
                {(previousRequestFile?.userFile ?? file.previousUserFile) && (
                  <ReplacedFileGroup>
                    {renderFileLink(
                      previousRequestFile?.userFile ?? file.previousUserFile!,
                      `${file.globalId}-previous`,
                      showFileStateIndicators ? replacedOriginalFileLinkSx : undefined,
                      "default",
                      undefined,
                      showFileStateIndicators ? "Replaced file" : undefined,
                    )}
                  </ReplacedFileGroup>
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
