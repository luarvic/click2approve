import { getSharedVerificationReceipt } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import {
  SharedVerificationFile,
  SharedVerificationReceipt,
} from "@/features/sharedVerificationLinks/models/sharedVerificationLink";
import { Dialogs, Files, StackSpacing } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { CheckCircleOutline, ErrorOutline, UploadFileOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface FileMatch {
  fileName: string;
  hashValue: string;
  matchedFile?: SharedVerificationFile;
}

const hashTextSx: SxProps<Theme> = {
  fontFamily: "monospace",
  overflowWrap: "anywhere",
};

const sectionSx: SxProps<Theme> = {
  my: 3,
};

const sectionHeaderSx: SxProps<Theme> = {
  mt: 2,
};

const certificateHeaderSx: SxProps<Theme> = {};

const receiptRecordSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  p: 1.5,
};

const receiptRecordLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  flexShrink: 0,
  minWidth: "7rem",
};

const receiptRecordValueSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const verifyFileButtonSx: SxProps<Theme> = {
  alignSelf: "flex-start",
  mt: 2,
};

const formatBytes = (size: number): string =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(size);

const computeSha256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const renderReceiptAttribute = (
  label: string,
  value: string,
  valueSx?: SxProps<Theme>,
) => (
  <Stack key={label} direction="row" spacing={StackSpacing.default}>
    <Box component="span" sx={receiptRecordLabelSx}>
      {label}
    </Box>
    <Box component="span" sx={[receiptRecordValueSx, ...(Array.isArray(valueSx) ? valueSx : valueSx ? [valueSx] : [])]}>
      {value}
    </Box>
  </Stack>
);

const renderSectionHeader = (title: string, description: string) => (
  <Box sx={sectionHeaderSx}>
    <Typography variant="h6" component="h2">
      {title}
    </Typography>
    <Typography color="text.secondary">
      {description}
    </Typography>
  </Box>
);

const SharedVerificationReceiptPage = () => {
  const { globalId } = useParams();
  const [receipt, setReceipt] = useState<SharedVerificationReceipt | null | undefined>(undefined);
  const [fileMatch, setFileMatch] = useState<FileMatch | null>(null);
  usePageTitle("Certificate of Completion");

  useEffect(() => {
    const load = async () => {
      setReceipt(globalId ? await getSharedVerificationReceipt(globalId) : null);
    };
    load();
  }, [globalId]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !receipt) {
      return;
    }

    const hashValue = await computeSha256(file);
    setFileMatch({
      fileName: file.name,
      hashValue,
      matchedFile: receipt.files.find((receiptFile) => receiptFile.hashValue.toLowerCase() === hashValue),
    });
    event.target.value = "";
  };

  if (receipt === null) {
    return <NotFoundPage />;
  }

  if (receipt === undefined) {
    return null;
  }

  return (
    <Container component="main" maxWidth="lg">
      <Stack spacing={Dialogs.formStackSpacing}>
        <Box sx={certificateHeaderSx}>
          <Typography variant="h4" component="h1">
            Certificate of Completion
          </Typography>
          <Typography color="text.secondary">
            This certificate confirms that the listed agreement was completed and identifies the files covered by that completion record.
          </Typography>
        </Box>
        <Box sx={sectionSx}>
          <Box sx={receiptRecordSx}>
            {renderReceiptAttribute("ID", receipt.globalId)}
            {renderReceiptAttribute("Created at", getLocaleDateTimeString(receipt.createdAt))}
          </Box>
        </Box>
        {renderSectionHeader(
          "Agreement summary",
          "This section identifies the approval request represented by this certificate.",
        )}
        <Box sx={sectionSx}>
          <Box sx={receiptRecordSx}>
            {renderReceiptAttribute("Type", "Approval request")}
            {renderReceiptAttribute("ID", receipt.approvalRequestGlobalId)}
            {renderReceiptAttribute("Title", receipt.approvalRequestTitle)}
            {renderReceiptAttribute("Status", "Approved")}
            {renderReceiptAttribute("Organization", receipt.createdByOrganizationDisplayName)}
            {renderReceiptAttribute("Requested at", getLocaleDateTimeString(receipt.approvalRequestCreatedAt))}
            {receipt.approvalRequestApprovedAt && (
              renderReceiptAttribute("Completed at", getLocaleDateTimeString(receipt.approvalRequestApprovedAt))
            )}
          </Box>
        </Box>
        {renderSectionHeader(
          "Files",
          "These files were attached to the approval request at completion time. File contents can be verified by matching SHA-256 hashes.",
        )}
        <Box sx={sectionSx}>
          <Stack spacing={Dialogs.formStackSpacing}>
            {receipt.files.map((file) => (
              <Box key={file.globalId} sx={receiptRecordSx}>
                {renderReceiptAttribute("Name", file.fileName)}
                {renderReceiptAttribute("Size", `${formatBytes(file.size)} bytes`)}
                {renderReceiptAttribute("SHA-256", file.hashValue, hashTextSx)}
              </Box>
            ))}
            <Button
              component="label"
              startIcon={<UploadFileOutlined />}
              sx={verifyFileButtonSx}
              variant="outlined"
            >
              Verify file
              <Box
                component="input"
                type="file"
                sx={Files.inputStyle}
                onChange={handleFileChange}
              />
            </Button>
            {fileMatch && (
              <Stack direction="row" spacing={StackSpacing.default} alignItems="center">
                {fileMatch.matchedFile ? (
                  <CheckCircleOutline color="success" />
                ) : (
                  <ErrorOutline color="error" />
                )}
                <Typography>
                  {fileMatch.matchedFile
                    ? `${fileMatch.fileName} matches ${fileMatch.matchedFile.fileName}.`
                    : `${fileMatch.fileName} does not match any approved file hash.`}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default SharedVerificationReceiptPage;
