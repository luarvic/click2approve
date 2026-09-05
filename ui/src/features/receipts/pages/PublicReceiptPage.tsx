import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { getReceiptByLink } from "@/features/receipts/api/receiptLinksApi";
import ReceiptView from "@/features/receipts/components/ReceiptView";
import {
  PublicReceiptParticipantRole,
  type PublicReceipt,
  type PublicReceiptFile,
} from "@/features/receipts/models/publicReceipt";
import { Files } from "@/shared/components/files/fileInputStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { StackSpacing } from "@/shared/theme/tokens";
import { CheckCircleOutline, ErrorOutline, UploadFileOutlined } from "@mui/icons-material";
import { Box, Button, Container, GlobalStyles, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { QRCodeSVG } from "qrcode.react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

interface FileMatch {
  fileName: string;
  hashValue: string;
  matchedFile?: PublicReceiptFile;
  taskGlobalId?: string;
}

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;
const qrCodeSize = 192;
const qrPanelVerticalPadding = 2;
const receiptLogoSize = 48;

const pageSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  py: { xs: 2, md: 4 },
  "@media print": {
    display: "block",
    minHeight: "auto",
    py: 0,
  },
};

const contentContainerSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flex: "1 0 auto",
  justifyContent: "center",
  "@media print": {
    display: "block",
  },
};

const receiptViewSx: SxProps<Theme> = {
  maxWidth: "100%",
  width: { sm: 960 },
  "@media print": {
    maxWidth: "none",
    width: "100%",
  },
};

const receiptCardSx: SxProps<Theme> = {
  "@media print": {
    boxShadow: "none",
  },
};

const verificationContentSx: SxProps<Theme> = {
  maxWidth: 600,
  mx: "auto",
  width: "100%",
};

const qrPanelSx: SxProps<Theme> = {
  alignItems: "center",
  py: qrPanelVerticalPadding,
  textAlign: "center",
};

const qrLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.85rem",
  lineHeight: 1.25,
  maxWidth: qrCodeSize,
};

const receiptLogoSx: SxProps<Theme> = {
  height: receiptLogoSize,
  width: receiptLogoSize,
};

const receiptBrandSx: SxProps<Theme> = {
  alignItems: "center",
  justifyContent: "center",
  py: qrPanelVerticalPadding,
};

const receiptBrandTextSx: SxProps<Theme> = {
  fontSize: `${receiptLogoSize * 0.75}px`,
  fontWeight: 500,
  lineHeight: 1,
};

const verificationFooterSx: SxProps<Theme> = {
  pt: 2,
  "@media print": {
    display: "none",
  },
};

const verifyFileButtonSx: SxProps<Theme> = {
  alignSelf: "center",
};

const printStyles = (
  <GlobalStyles
    styles={{
      "@page": {
        margin: "10mm",
        size: "A4",
      },
      "@media print": {
        "html, body, #root": {
          background: "#fff",
        },
        body: {
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        },
      },
    }}
  />
);

const computeSha256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const PublicReceiptPage = () => {
  const { linkGlobalId } = useParams<{ linkGlobalId: string }>();
  const [receipt, setReceipt] = useState<PublicReceipt | null | undefined>(undefined);
  const [fileMatch, setFileMatch] = useState<FileMatch | null>(null);
  usePageTitle(`Receipt Verification ${getApprovalRequestNumber(linkGlobalId)}`);

  useEffect(() => {
    const load = async () => {
      setReceipt(linkGlobalId ? await getReceiptByLink(linkGlobalId) : null);
    };

    void load();
  }, [linkGlobalId]);

  const verificationUrl = useMemo(() => window.location.href, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !receipt) {
      return;
    }

    const hashValue = await computeSha256(file);
    const matchedFile = receipt.files.find((receiptFile) => receiptFile.hashValue.toLowerCase() === hashValue);
    const matchedTask = matchedFile
      ? undefined
      : receipt.participants.find(
          (participant) =>
            participant.role === PublicReceiptParticipantRole.Assignee &&
            participant.files.some((taskFile) => taskFile.hashValue.toLowerCase() === hashValue),
        );
    setFileMatch({
      fileName: file.name,
      hashValue,
      matchedFile: matchedFile ?? matchedTask?.files.find((taskFile) => taskFile.hashValue.toLowerCase() === hashValue),
      taskGlobalId: matchedTask?.taskGlobalId,
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
    <>
      {printStyles}
      <Box component="main" sx={pageSx}>
        <Box sx={contentContainerSx}>
          <Box sx={receiptViewSx}>
            <ReceiptView
              cardSx={receiptCardSx}
              footerContent={
                <Stack spacing={StackSpacing.tight} sx={qrPanelSx}>
                  <QRCodeSVG level="H" size={qrCodeSize} value={verificationUrl} />
                  <Typography sx={qrLabelSx}>Scan the QR code to verify this receipt</Typography>
                </Stack>
              }
              receipt={receipt}
              titleContent={
                <Stack direction="row" spacing={StackSpacing.tight} sx={receiptBrandSx}>
                  <Box component="img" src={logoSrc} alt="Click2Approve" sx={receiptLogoSx} />
                  <Typography component="span" sx={receiptBrandTextSx}>
                    Click2Approve
                  </Typography>
                </Stack>
              }
            />
          </Box>
        </Box>
        <Container disableGutters maxWidth="md" sx={verificationFooterSx}>
          <Stack spacing={StackSpacing.default} sx={verificationContentSx}>
            <Button component="label" startIcon={<UploadFileOutlined />} sx={verifyFileButtonSx} variant="outlined">
              Verify file
              <Box component="input" type="file" sx={Files.inputStyle} onChange={handleFileChange} />
            </Button>
            {fileMatch && (
              <Stack direction="row" spacing={StackSpacing.default} alignItems="center">
                {fileMatch.matchedFile ? <CheckCircleOutline color="success" /> : <ErrorOutline color="error" />}
                <Typography>
                  {fileMatch.matchedFile
                    ? `${fileMatch.fileName} matches ${fileMatch.matchedFile.fileName} attached to ${
                        fileMatch.taskGlobalId
                          ? `task # ${fileMatch.taskGlobalId}`
                          : `request # ${receipt.approvalRequestGlobalId}`
                      }.`
                    : `${fileMatch.fileName} does not match any attached file hash.`}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default PublicReceiptPage;
