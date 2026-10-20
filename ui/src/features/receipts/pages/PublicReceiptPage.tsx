import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { getReceiptByLink } from "@/features/receipts/api/receiptLinksApi";
import ReceiptView from "@/features/receipts/components/ReceiptView";
import ReceiptFileVerification from "@/features/receipts/components/verification/ReceiptFileVerification";
import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import { Pages } from "@/shared/components/layout/pageStyles";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
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
const receiptLogoSize = 36;
const receiptBrandVerticalSpacing = 2;

const pageSx: SxProps<Theme> = {
  ...Pages.containerSx,
  pt: { xs: receiptBrandVerticalSpacing, md: receiptBrandVerticalSpacing },
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  "@media print": {
    display: "block",
    minHeight: "auto",
    p: 0,
  },
};

const contentContainerSx: SxProps<Theme> = {
  alignItems: "flex-start",
  display: "flex",
  flex: "1 0 auto",
  justifyContent: "center",
  "@media print": {
    display: "block",
  },
};

const receiptViewSx: SxProps<Theme> = {
  maxWidth: 960,
  minWidth: 0,
  width: "100%",
  "@media print": {
    maxWidth: "none",
    width: "100%",
  },
};

const receiptCardSx: SxProps<Theme> = {
  "@media print": { backgroundColor: "#fff", border: 0, boxShadow: "none" },
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
  color: "inherit",
  textDecoration: "none",
  width: "fit-content",
  justifyContent: "flex-start",
  mb: receiptBrandVerticalSpacing,
  "@media print": {
    breakAfter: "avoid",
    color: "#162b20",
  },
};

const receiptLogoSx: SxProps<Theme> = {
  display: "block",
  flex: "0 0 auto",
  height: receiptLogoSize,
  minHeight: receiptLogoSize,
  width: "auto",
};

const receiptBrandTextSx: SxProps<Theme> = {
  fontSize: "1.1875rem",
  fontWeight: 600,
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
  usePageTitle(`Receipt verification ${getApprovalRequestNumber(linkGlobalId)}`);

  useEffect(() => {
    let active = true;
    setReceipt(undefined);
    const load = async () => {
      const loadedReceipt = linkGlobalId ? await getReceiptByLink(linkGlobalId) : null;
      if (active) setReceipt(loadedReceipt);
    };

    void load();
    return () => {
      active = false;
    };
  }, [linkGlobalId]);

  const verificationUrl = useMemo(() => window.location.href, []);

  if (receipt === null) {
    return (
      <Box component="main" sx={pageSx}>
        <NotFoundPage />
      </Box>
    );
  }

  if (receipt === undefined) {
    return (
      <Box component="main" aria-label="Receipt verification" aria-busy sx={pageSx}>
        <LoadingOverlay />
      </Box>
    );
  }

  return (
    <>
      {printStyles}
      <Box component="main" sx={pageSx}>
        <Box sx={contentContainerSx}>
          <Box sx={receiptViewSx}>
            <Stack
              component="a"
              href="/"
              aria-label="Click2Approve home"
              direction="row"
              spacing={StackSpacing.tight}
              sx={receiptBrandSx}
            >
              <Box component="img" src={logoSrc} alt="" aria-hidden="true" sx={receiptLogoSx} />
              <Typography component="span" variant="h6" sx={receiptBrandTextSx}>
                Click2Approve
              </Typography>
            </Stack>
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
