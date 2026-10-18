import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { getReceiptByLink } from "@/features/receipts/api/receiptLinksApi";
import ReceiptView from "@/features/receipts/components/ReceiptView";
import ReceiptFileVerification from "@/features/receipts/components/verification/ReceiptFileVerification";
import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { StackSpacing } from "@/shared/theme/tokens";
import { Box, Container, GlobalStyles, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo-wall-to-wall.svg`;
const qrCodeSize = 192;
const receiptLogoSize = 48;

const pageSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  pb: { xs: 2, md: 4 },
  pt: { xs: 1, md: 2 },
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
  border: 0,
  boxShadow: "none",
};

const qrPanelSx: SxProps<Theme> = {
  alignItems: "center",
  pb: 1,
  textAlign: "center",
};

const qrCodeFrameSx: SxProps<Theme> = {
  bgcolor: "common.white",
  display: "flex",
  p: 2,
};

const qrLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.85rem",
  lineHeight: 1.25,
  maxWidth: qrCodeSize,
};

const receiptBrandSx: SxProps<Theme> = {
  alignItems: "center",
  justifyContent: "center",
};

const receiptLogoSx: SxProps<Theme> = {
  display: "block",
  flex: "0 0 auto",
  height: receiptLogoSize,
  minHeight: receiptLogoSize,
  width: "auto",
};

const receiptHelpSx: SxProps<Theme> = {
  "@media print": { display: "none" },
};

const receiptBrandTextSx: SxProps<Theme> = {
  fontSize: "1.75rem",
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

const PublicReceiptPage = () => {
  const { linkGlobalId } = useParams<{ linkGlobalId: string }>();
  const [receipt, setReceipt] = useState<PublicReceipt | null | undefined>(undefined);
  usePageTitle(`Receipt Verification ${getApprovalRequestNumber(linkGlobalId)}`);

  useEffect(() => {
    const load = async () => {
      setReceipt(linkGlobalId ? await getReceiptByLink(linkGlobalId) : null);
    };

    void load();
  }, [linkGlobalId]);

  const verificationUrl = useMemo(() => window.location.href, []);

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
              afterTitleContent={
                <Stack spacing={StackSpacing.tight} sx={qrPanelSx}>
                  <Box sx={qrCodeFrameSx}>
                    <QRCodeSVG level="H" size={qrCodeSize} value={verificationUrl} />
                  </Box>
                  <Typography sx={qrLabelSx}>Scan the QR code to verify this receipt</Typography>
                </Stack>
              }
              cardSx={receiptCardSx}
              receipt={receipt}
              titleContent={
                <Stack direction="row" spacing={StackSpacing.tight} sx={receiptBrandSx}>
                  <Box component="img" src={logoSrc} alt="Click2Approve" sx={receiptLogoSx} />
                  <Typography component="span" variant="h6" sx={receiptBrandTextSx}>
                    Click2Approve
                  </Typography>
                  <Box component="span" sx={receiptHelpSx}>
                    <HelpPopover
                      docsHref="/docs/receipts/"
                      helpText="Review this receipt or verify that your file matches a recorded attachment."
                    />
                  </Box>
                </Stack>
              }
            />
          </Box>
        </Box>
        <Container disableGutters maxWidth={false} sx={receiptViewSx}>
          <ReceiptFileVerification key={linkGlobalId} receipt={receipt} />
        </Container>
      </Box>
    </>
  );
};

export default PublicReceiptPage;
