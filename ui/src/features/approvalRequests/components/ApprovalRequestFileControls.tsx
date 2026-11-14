import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { Files } from "@/shared/components/files/fileInputStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { AttachFile } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { useRef } from "react";

interface ApprovalRequestFileControlsProps {
  files: UserFile[];
  newFiles?: UserFile[];
  disabled?: boolean;
  uploading?: boolean;
  onDownload: (file: UserFile) => void;
  onRemove?: (index: number) => void;
  onRemoveNew?: (index: number) => void;
  onUpload?: (files: File[]) => void;
}

const ApprovalRequestFileControls = ({
  files,
  newFiles = [],
  disabled = false,
  uploading = false,
  onDownload,
  onRemove,
  onRemoveNew,
  onUpload,
}: ApprovalRequestFileControlsProps) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Stack spacing={StackSpacing.default}>
      <ApprovalRequestFilesList
        existingFiles={files.map((file) => ({ file }))}
        newFiles={newFiles}
        isActionsDisabled={disabled}
        linkVariant="body1"
        onDownloadExisting={onDownload}
        onRemoveExisting={onRemove}
        onRemoveNew={onRemoveNew ?? (() => undefined)}
      />
      {onUpload && (
        <>
          <Button
            disabled={disabled}
            loading={uploading}
            startIcon={<AttachFile />}
            onClick={() => input.current?.click()}
            sx={{ alignSelf: "flex-start" }}
          >
            Attach files
          </Button>
          <input
            ref={input}
            multiple
            style={Files.inputStyle}
            type="file"
            onChange={(event) => {
              onUpload(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </>
      )}
    </Stack>
  );
};

export default ApprovalRequestFileControls;
