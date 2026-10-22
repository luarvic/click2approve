import type { PublicReceipt, PublicReceiptFile } from "@/features/receipts/models/publicReceipt";
import { ReceiptParticipantRole, type Receipt } from "@/features/receipts/models/receipt";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Files } from "@/shared/components/files/fileInputStyles";
import { UploadFileOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ChangeEvent, ReactNode } from "react";
import { useRef, useState } from "react";

interface ReceiptFileVerificationProps {
  receipt: Receipt | PublicReceipt;
  renderActions?: (verifyButton: ReactNode) => ReactNode;
}

interface FileMatch {
  fileName: string;
  matchedFile?: PublicReceiptFile;
  taskGlobalId?: string;
}

const verificationContentSx: SxProps<Theme> = {
  width: "100%",
  "@media print": { display: "none" },
};

const verifyFileButtonSx: SxProps<Theme> = {
  alignSelf: "center",
  mt: 3,
};

const verificationAlertSx: SxProps<Theme> = {
  mt: 2,
  overflowWrap: "anywhere",
  px: 2,
  py: 1.5,
  "& .MuiAlert-message": { minWidth: 0 },
};

const computeSha256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const ReceiptFileVerification = ({ receipt, renderActions }: ReceiptFileVerificationProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileMatch, setFileMatch] = useState<FileMatch | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = "";
    setFileMatch(null);
    setVerificationFailed(false);
    setIsVerifying(true);
    try {
      const hashValue = await computeSha256(file);
      const matchedFile = receipt.files.find((receiptFile) => receiptFile.hashValue.toLowerCase() === hashValue);
      const matchedTask = matchedFile
        ? undefined
        : receipt.participants.find(
            (participant) =>
              participant.role === ReceiptParticipantRole.Assignee &&
              participant.files.some((taskFile) => taskFile.hashValue.toLowerCase() === hashValue),
          );
      setFileMatch({
        fileName: file.name,
        matchedFile:
          matchedFile ?? matchedTask?.files.find((taskFile) => taskFile.hashValue.toLowerCase() === hashValue),
        taskGlobalId: matchedTask?.taskGlobalId,
      });
    } catch {
      setVerificationFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyButton = (
    <MainActionButton
      loading={isVerifying}
      onClick={() => inputRef.current?.click()}
      startIcon={<UploadFileOutlined />}
      sx={renderActions ? undefined : verifyFileButtonSx}
    >
      Verify file
    </MainActionButton>
  );

  return (
    <Stack sx={verificationContentSx}>
      {fileMatch && (
        <Alert severity={fileMatch.matchedFile ? "success" : "error"} sx={verificationAlertSx}>
          <AlertTitle>{fileMatch.matchedFile ? "File verified" : "File does not match"}</AlertTitle>
          {fileMatch.matchedFile ? (
            <>
              <strong>{fileMatch.fileName}</strong> has the same SHA-256 hash as{" "}
              <strong>{fileMatch.matchedFile.fileName}</strong> attached to{" "}
              {fileMatch.taskGlobalId
                ? `task # ${fileMatch.taskGlobalId}`
                : `request # ${receipt.approvalRequestGlobalId}`}
              .
            </>
          ) : (
            <>
              <strong>{fileMatch.fileName}</strong> does not match any file recorded on this receipt. Check that you
              selected the correct version of the file and try again.
            </>
          )}
        </Alert>
      )}
      {verificationFailed && (
        <Alert severity="error" sx={verificationAlertSx}>
          <AlertTitle>Unable to verify file</AlertTitle>
          The file could not be read. Select it again to retry.
        </Alert>
      )}
      {renderActions ? renderActions(verifyButton) : verifyButton}
      <Box component="input" ref={inputRef} type="file" sx={Files.inputStyle} onChange={handleFileChange} />
    </Stack>
  );
};

export default ReceiptFileVerification;
