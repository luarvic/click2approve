import { getSharedVerificationReceipt } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import {
  SharedVerificationFile,
  SharedVerificationReceipt,
} from "@/features/sharedVerificationLinks/models/sharedVerificationLink";
import { Files, Routes, Shell, StackSpacing } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { CheckCircleOutline, ErrorOutline, UploadFileOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  GlobalStyles,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { QRCodeSVG } from "qrcode.react";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

interface FileMatch {
  fileName: string;
  hashValue: string;
  matchedFile?: SharedVerificationFile;
}

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;
const qrCodeSize = 120;
const tableStackContainerMaxWidth = 850;

const pageSx: SxProps<Theme> = {
  minHeight: "100vh",
  pb: { xs: 2, md: 4 },
  pt: 0,
  "@media print": {
    minHeight: "auto",
    pb: 0,
  },
};

const certificateSx: SxProps<Theme> = {
  color: "text.primary",
  mx: "auto",
  pb: { xs: 2, sm: 3 },
  pt: { xs: 2, sm: 3 },
  px: { xs: 2, sm: 3 },
  width: "100%",
  "@media print": {
    pb: 0,
    pt: 0,
    px: 0,
  },
};

const headerSx: SxProps<Theme> = {
  alignItems: "start",
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" },
};

const logoSx: SxProps<Theme> = {
  ...Shell.appBarLogoSx,
};

const titleLineSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  minWidth: 0,
  width: "100%",
};

const homeLinkSx: SxProps<Theme> = {
  color: "inherit",
  textDecoration: "none",
  width: "fit-content",
  "&:hover": {
    textDecoration: "none",
  },
};

const titleSx: SxProps<Theme> = {
  ...Shell.appBarBrandTitleSx(true),
  whiteSpace: "normal",
};

const sectionSx: SxProps<Theme> = {
  breakInside: "avoid",
  containerType: "inline-size",
};

const sectionTitleSx: SxProps<Theme> = {
  fontSize: "1.05rem",
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const summaryGridSx: SxProps<Theme> = {
  display: "grid",
  gap: 2,
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
};

const fieldSx: SxProps<Theme> = {
  minWidth: 0,
};

const labelSx: SxProps<Theme> = {
  color: "text.secondary",
  display: "block",
  fontSize: "1rem",
  lineHeight: 1.35,
};

const valueSx: SxProps<Theme> = {
  display: "block",
  fontSize: "1rem",
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const successValueSx: SxProps<Theme> = {
  ...valueSx,
  alignItems: "center",
  color: "success.main",
  display: "flex",
  fontWeight: 700,
  gap: 0.5,
};

const hashTextSx: SxProps<Theme> = {
  fontFamily: "monospace",
  fontSize: "1rem",
  lineHeight: 1.35,
  overflowWrap: "anywhere",
};

const tableHeaderCellSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "1rem",
  fontWeight: 400,
  px: 0,
  py: 0.75,
};

const tableCellSx: SxProps<Theme> = {
  fontSize: "1rem",
  overflowWrap: "anywhere",
  px: 0,
  py: 0.9,
  verticalAlign: "top",
};

const tableLastCellSx: SxProps<Theme> = {
  ...tableCellSx,
  whiteSpace: "nowrap",
};

const tableLastRowSx: SxProps<Theme> = {
  "& td": {
    borderBottom: 0,
  },
};

const responsiveTableSx: SxProps<Theme> = {
  display: "table",
  "& th:not(:first-of-type), & td:not(:first-of-type)": {
    pl: 2,
  },
  "& th:not(:last-child), & td:not(:last-child)": {
    pr: 2,
  },
  [`@container (max-width: ${tableStackContainerMaxWidth}px)`]: {
    display: "none",
  },
  "@media print": {
    display: "table",
  },
};

const participantTableSx: SxProps<Theme> = {
  ...responsiveTableSx,
  tableLayout: "fixed",
};

const participantNameColumnSx: SxProps<Theme> = {
  width: "15%",
};

const participantEmailColumnSx: SxProps<Theme> = {
  width: "25%",
};

const participantOrganizationColumnSx: SxProps<Theme> = {
  width: "15%",
};

const participantRelationshipColumnSx: SxProps<Theme> = {
  width: "15%",
};

const participantActionColumnSx: SxProps<Theme> = {
  width: "15%",
};

const participantPerformedAtColumnSx: SxProps<Theme> = {
  width: "15%",
};

const mobileRecordStackSx: SxProps<Theme> = {
  display: "none",
  [`@container (max-width: ${tableStackContainerMaxWidth}px)`]: {
    display: "flex",
  },
  "@media print": {
    display: "none",
  },
};

const mobileRecordSx: SxProps<Theme> = {
  borderBottom: "1px solid",
  borderColor: "divider",
  pb: 1.5,
};

const mobileLastRecordSx: SxProps<Theme> = {
  borderBottom: 0,
  pb: 0,
};

const verifyFileButtonSx: SxProps<Theme> = {
  alignSelf: "flex-start",
};

const qrPanelSx: SxProps<Theme> = {
  justifySelf: { xs: "start", sm: "end" },
  textAlign: { xs: "left", sm: "center" },
};

const qrLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: "0.85rem",
  lineHeight: 1.25,
  mt: 0.75,
  maxWidth: qrCodeSize,
};

const screenOnlySx: SxProps<Theme> = {
  "@media print": {
    display: "none",
  },
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

const formatBytes = (size: number): string =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(size);

const formatHash = (hashValue: string): string =>
  hashValue.match(/.{1,8}/g)?.join(" ") ?? hashValue;

const formatCertificateDateTime = (date: Date | undefined): string =>
  date
    ? date.toLocaleString(undefined, {
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      month: "numeric",
      second: "2-digit",
      timeZoneName: "short",
      year: "numeric",
    })
    : "";

const formatParticipantOrganization = (organizationDisplayName?: string): string =>
  organizationDisplayName || "N/A";

const computeSha256 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const renderField = (
  label: string,
  value?: string | React.ReactNode | null,
  sx: SxProps<Theme> = valueSx,
) => (
  <Box key={label} sx={fieldSx}>
    <Box component="span" sx={labelSx}>
      {label}
    </Box>
    <Box component="span" sx={sx}>
      {value || "Not recorded"}
    </Box>
  </Box>
);

const renderSectionTitle = (title: string) => (
  <Typography variant="h2" sx={sectionTitleSx}>
    {title}
  </Typography>
);

const getMobileRecordSx = (isLast: boolean): SxProps<Theme> => [
  mobileRecordSx,
  ...(isLast ? [mobileLastRecordSx] : []),
];

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

  const verificationUrl = useMemo(() => window.location.href, []);

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
    <>
      {printStyles}
      <Box sx={pageSx}>
        <Container component="main" maxWidth="md" disableGutters>
          <Stack spacing={StackSpacing.loose} sx={certificateSx}>
            <Box sx={headerSx}>
              <Stack spacing={StackSpacing.default}>
                <Box
                  component={RouterLink}
                  to={Routes.defaultPath}
                  aria-label="Click2Approve home"
                  sx={[titleLineSx, homeLinkSx]}
                >
                  <Box component="img" src={logoSrc} alt="" aria-hidden="true" sx={logoSx} />
                  <Typography component="h1" variant="h6" sx={titleSx}>
                    Click2Approve Certificate of Completion
                  </Typography>
                </Box>
                <Typography>
                  This certificate records the successful completion of the request identified below and the files associated with it at the time of completion.
                </Typography>
                {renderField("Certificate ID", receipt.globalId)}
                {renderField("Generated at", formatCertificateDateTime(receipt.createdAt))}
              </Stack>
              <Box sx={qrPanelSx}>
                <QRCodeSVG value={verificationUrl} size={qrCodeSize} />
                <Typography sx={qrLabelSx}>
                  Scan the QR code to verify this certificate
                </Typography>
              </Box>
            </Box>

            <Stack spacing={StackSpacing.default} sx={sectionSx}>
              {renderSectionTitle("Summary")}
              <Box sx={summaryGridSx}>
                <Stack spacing={StackSpacing.default}>
                  {renderField("Request title", receipt.approvalRequestTitle)}
                  {renderField("Request description", receipt.approvalRequestDescription)}
                  {renderField("Revision", String(receipt.revisionNumber))}
                  {renderField("Request ID", receipt.approvalRequestGlobalId)}
                  {renderField("Organization", receipt.createdByOrganizationDisplayName)}
                </Stack>
                <Stack spacing={StackSpacing.default}>
                  {renderField(
                    "Status",
                    <>
                      <CheckCircleOutline fontSize="small" />
                      Completed successfully
                    </>,
                    successValueSx,
                  )}
                  {renderField("Submitted at", formatCertificateDateTime(receipt.approvalRequestCreatedAt))}
                  {renderField("Completed at", receipt.approvalRequestApprovedAt
                    ? formatCertificateDateTime(receipt.approvalRequestApprovedAt)
                    : undefined)}
                </Stack>
              </Box>
            </Stack>

            <Stack spacing={StackSpacing.default} sx={sectionSx}>
              {renderSectionTitle("Files")}
              <Table size="small" sx={responsiveTableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={tableHeaderCellSx}>Filename</TableCell>
                    <TableCell sx={tableHeaderCellSx}>SHA-256</TableCell>
                    <TableCell align="right" sx={tableHeaderCellSx}>Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipt.files.map((file, index) => (
                    <TableRow
                      key={file.globalId}
                      sx={index === receipt.files.length - 1 ? tableLastRowSx : undefined}
                    >
                      <TableCell sx={tableCellSx}>{file.fileName}</TableCell>
                      <TableCell sx={[tableCellSx, hashTextSx]}>
                        {formatHash(file.hashValue)}
                      </TableCell>
                      <TableCell align="right" sx={tableLastCellSx}>
                        {formatBytes(file.size)} bytes
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Stack spacing={StackSpacing.default} sx={mobileRecordStackSx}>
                {receipt.files.map((file, index) => (
                  <Stack
                    key={file.globalId}
                    spacing={StackSpacing.default}
                    sx={getMobileRecordSx(index === receipt.files.length - 1)}
                  >
                    {renderField("Filename", file.fileName)}
                    {renderField("SHA-256", formatHash(file.hashValue), hashTextSx)}
                    {renderField("Size", `${formatBytes(file.size)} bytes`)}
                  </Stack>
                ))}
              </Stack>
              <Stack spacing={StackSpacing.default} sx={screenOnlySx}>
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
            </Stack>

            <Stack spacing={StackSpacing.default} sx={sectionSx}>
              {renderSectionTitle("Participants")}
              <Table size="small" sx={participantTableSx}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={[tableHeaderCellSx, participantNameColumnSx]}>Participant</TableCell>
                    <TableCell sx={[tableHeaderCellSx, participantEmailColumnSx]}>Email</TableCell>
                    <TableCell sx={[tableHeaderCellSx, participantOrganizationColumnSx]}>Organization</TableCell>
                    <TableCell sx={[tableHeaderCellSx, participantRelationshipColumnSx]}>Relationship</TableCell>
                    <TableCell sx={[tableHeaderCellSx, participantActionColumnSx]}>Action</TableCell>
                    <TableCell align="right" sx={[tableHeaderCellSx, participantPerformedAtColumnSx]}>
                      Performed at
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(receipt.participants ?? []).map((participant, index) => (
                    <TableRow
                      key={`${participant.role}-${participant.displayName}-${index}`}
                      sx={index === (receipt.participants ?? []).length - 1 ? tableLastRowSx : undefined}
                    >
                      <TableCell sx={[tableCellSx, participantNameColumnSx]}>
                        {participant.displayName}
                      </TableCell>
                      <TableCell sx={[tableCellSx, participantEmailColumnSx]}>
                        {participant.email}
                      </TableCell>
                      <TableCell sx={[tableCellSx, participantOrganizationColumnSx]}>
                        {formatParticipantOrganization(participant.organizationDisplayName)}
                      </TableCell>
                      <TableCell sx={[tableCellSx, participantRelationshipColumnSx]}>
                        {participant.role}
                      </TableCell>
                      <TableCell sx={[tableCellSx, participantActionColumnSx]}>
                        {participant.action}
                      </TableCell>
                      <TableCell align="right" sx={[tableCellSx, participantPerformedAtColumnSx]}>
                        {participant.completedAt
                          ? formatCertificateDateTime(participant.completedAt)
                          : "Not recorded"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Stack spacing={StackSpacing.default} sx={mobileRecordStackSx}>
                {(receipt.participants ?? []).map((participant, index) => (
                  <Stack
                    key={`${participant.role}-${participant.displayName}-${index}`}
                    spacing={StackSpacing.default}
                    sx={getMobileRecordSx(index === (receipt.participants ?? []).length - 1)}
                  >
                    {renderField("Participant", participant.displayName)}
                    {renderField("Email", participant.email)}
                    {renderField("Organization", formatParticipantOrganization(participant.organizationDisplayName))}
                    {renderField("Relationship", participant.role)}
                    {renderField("Action", participant.action)}
                    {renderField(
                      "Performed at",
                      participant.completedAt
                        ? formatCertificateDateTime(participant.completedAt)
                        : undefined,
                    )}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default SharedVerificationReceiptPage;
