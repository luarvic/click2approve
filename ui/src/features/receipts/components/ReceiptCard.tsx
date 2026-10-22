import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestStatusChip from "@/features/approvalRequests/components/ApprovalRequestStatusChip";
import {
  getApprovalRequestStatusLabel,
  getApprovalRequestStatusLineColor,
  getApprovalRequestTaskStatusLabel,
  getApprovalRequestTaskStatusLineColor,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ReceiptSignature from "@/features/receipts/components/ReceiptSignature";
import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import { ReceiptParticipantRole, type Receipt } from "@/features/receipts/models/receipt";
import CardHeading from "@/shared/components/papers/CardHeading";
import { StatusLineColors } from "@/shared/components/status/StatusLines";
import { StackSpacing } from "@/shared/theme/tokens";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ReceiptCardProps {
  afterTitleContent?: ReactNode;
  footerContent?: ReactNode;
  headerContent?: ReactNode;
  receipt: Receipt | PublicReceipt;
  sx?: SxProps<Theme>;
  titleContent?: ReactNode;
}

const receiptContentSx: SxProps<Theme> = {
  p: { xs: 2.5, md: 3.5 },
  "&:last-child": { pb: { xs: 2.5, md: 3.5 } },
  "@media print": {
    backgroundColor: "#fff",
    color: "#162b20",
    "& .MuiTypography-root, & .MuiBox-root": { color: "#162b20" },
  },
};
const headingSx: SxProps<Theme> = { fontWeight: 500, textAlign: "left" };
const receiptHeaderStackSpacing = StackSpacing.loose;
const receiptSectionSpacing = StackSpacing.extraLoose;
const sectionHeadingSx: SxProps<Theme> = {
  pb: 1.5,
  "@media print": {
    breakAfter: "avoid",
    pageBreakAfter: "avoid",
  },
};
const fieldSx: SxProps<Theme> = {
  alignItems: "start",
  borderTop: 1,
  borderColor: "divider",
  columnGap: 2,
  display: "grid",
  gridTemplateColumns: "minmax(90px, 1fr) minmax(0, 2fr)",
  py: 1.5,
  "@media print": {
    borderColor: "rgba(0, 0, 0, 0.12)",
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
};
const fieldLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  overflowWrap: "anywhere",
  "@media print": { color: "#52645a" },
};
const fieldValueSx: SxProps<Theme> = { minWidth: 0, overflowWrap: "anywhere" };
const hashValueSx: SxProps<Theme> = { fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" };
const signatureValueSx: SxProps<Theme> = { minWidth: 0 };

const printSectionSx = {
  "@media print": {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
} satisfies SxProps<Theme>;

const receiptDetailSectionSx = {
  pt: 2,
} satisfies SxProps<Theme>;

const formatBytes = (size: number): string => `${new Intl.NumberFormat().format(size)} bytes`;

const formatSha256 = (hashValue: string): string => hashValue.match(/.{1,8}/g)?.join(" ") ?? hashValue;

const hasText = (value: string | undefined): value is string => Boolean(value?.trim());

const getTaskStatus = (result: boolean | undefined): string | undefined => {
  if (result === true) return "Completed";
  if (result === false) return "Rejected";
  return undefined;
};

const getTaskAction = (action: string): ApprovalRequestTaskAction =>
  ApprovalRequestTaskAction[action as keyof typeof ApprovalRequestTaskAction] as ApprovalRequestTaskAction;

const getReceiptTaskStatusColor = (taskStatus: ApprovalRequestTaskStatus | undefined, result: boolean | undefined) =>
  getApprovalRequestTaskStatusLineColor(taskStatus ?? ApprovalRequestTaskStatus.Completed, result);

const getRequestCompletedAt = (receipt: Receipt | PublicReceipt): Date | undefined =>
  (receipt as Receipt).approvalRequestCompletedAt ?? (receipt as PublicReceipt).approvalRequestApprovedAt;

const ReceiptCard: React.FC<ReceiptCardProps> = ({
  afterTitleContent,
  footerContent,
  headerContent,
  receipt,
  sx,
  titleContent,
}) => {
  const tasks = receipt.participants.filter((participant) => participant.role === ReceiptParticipantRole.Assignee);
  const requestStatusColor = getApprovalRequestStatusLineColor(
    receipt.approvalRequestStatus,
    receipt.approvalRequestResult,
  );
  const requestFields = [
    ["Request ID", receipt.approvalRequestGlobalId],
    ["Date", getLocaleDateTimeString(receipt.approvalRequestCreatedAt)],
    ["Organization", receipt.organizationDisplayName || receipt.tenantDisplayName],
    ["Title", receipt.approvalRequestTitle],
    ["Revision", receipt.revisionNumber > 1 ? String(receipt.revisionNumber) : undefined],
    ["Description", receipt.approvalRequestDescription],
    ["Requested by", receipt.requesterDisplayName],
    ["Submitted by", receipt.submittedByDisplayName],
    ["Completed at", getLocaleDateTimeString(getRequestCompletedAt(receipt))],
    ["Completed by", receipt.approvalRequestCompletedByDisplayName],
    ["Status", getApprovalRequestStatusLabel(receipt.approvalRequestStatus, receipt.approvalRequestResult)],
  ];

  return (
    <ApprovalRequestDetailsCard ariaLabel="Receipt" contentSx={receiptContentSx} showStatusBorder={false} sx={sx}>
      <Stack spacing={receiptSectionSpacing}>
        <Stack spacing={receiptHeaderStackSpacing} sx={printSectionSx}>
          {headerContent}
          <CardHeading variant="cardTitle">Receipt {getApprovalRequestNumber(receipt.globalId)}</CardHeading>
          <Stack spacing={StackSpacing.tight}>
            {titleContent && (
              <Typography component="h1" sx={headingSx} variant="h6">
                {titleContent}
              </Typography>
            )}
            {afterTitleContent}
            <Box sx={fieldSx}>
              <Typography component="span" sx={fieldLabelSx}>
                Receipt ID
              </Typography>
              <Typography component="span" sx={fieldValueSx}>
                {receipt.globalId}
              </Typography>
            </Box>
            <Box sx={fieldSx}>
              <Typography component="span" sx={fieldLabelSx}>
                Date
              </Typography>
              <Typography component="span" sx={fieldValueSx}>
                {getLocaleDateTimeString(receipt.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Stack sx={receiptDetailSectionSx}>
          <Stack spacing={StackSpacing.tight}>
            <CardHeading sx={sectionHeadingSx}>
              Request {getApprovalRequestNumber(receipt.approvalRequestGlobalId)}
            </CardHeading>
            {requestFields
              .filter(([, value]) => hasText(value))
              .map(([label, value]) => (
                <Box key={label} sx={fieldSx}>
                  <Typography component="span" sx={fieldLabelSx}>
                    {label}
                  </Typography>
                  {label === "Status" ? (
                    <Box sx={fieldValueSx}>
                      <ApprovalRequestStatusChip color={StatusLineColors[requestStatusColor]} label={value!} />
                    </Box>
                  ) : (
                    <Typography component="span" sx={label === "SHA-256" ? [fieldValueSx, hashValueSx] : fieldValueSx}>
                      {value}
                    </Typography>
                  )}
                </Box>
              ))}
            {receipt.files.map((file) => (
              <Stack key={file.globalId} spacing={StackSpacing.tight}>
                {[
                  ["Attached file", file.fileName],
                  ["SHA-256", formatSha256(file.hashValue)],
                  ["Size", formatBytes(file.size)],
                ].map(([label, value]) => (
                  <Box key={label} sx={fieldSx}>
                    <Typography component="span" sx={fieldLabelSx}>
                      {label}
                    </Typography>
                    <Typography component="span" sx={label === "SHA-256" ? [fieldValueSx, hashValueSx] : fieldValueSx}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack spacing={receiptSectionSpacing}>
          {tasks.length === 0 && <Typography color="textSecondary">No tasks were recorded</Typography>}
          <Stack spacing={receiptSectionSpacing}>
            {tasks.map((task, index) => (
              <Stack
                key={`${task.email}-${task.completedAt?.toISOString() ?? index}`}
                spacing={StackSpacing.tight}
                sx={receiptDetailSectionSx}
              >
                <CardHeading sx={sectionHeadingSx}>Task {getApprovalRequestNumber(task.taskGlobalId)}</CardHeading>
                {[
                  ["Task ID", task.taskGlobalId],
                  ["Date", getLocaleDateTimeString(task.assignedAt)],
                  ["Organization", task.isAssigneeEmployee ? task.organizationDisplayName : undefined],
                  ["Action", task.action],
                  ["Instructions", task.instructions],
                  ["Assigned to", task.displayName],
                  ["Completed at", getLocaleDateTimeString(task.completedAt)],
                  ["Completed by", task.completedByDisplayName],
                  [
                    "Status",
                    task.taskStatus === undefined
                      ? getTaskStatus(task.result)
                      : getApprovalRequestTaskStatusLabel(task.taskStatus, getTaskAction(task.action), task.result),
                  ],
                  ["Comment", task.comment],
                ]
                  .filter(([, value]) => hasText(value))
                  .map(([label, value]) => (
                    <Box key={label} sx={fieldSx}>
                      <Typography component="span" sx={fieldLabelSx}>
                        {label}
                      </Typography>
                      {label === "Status" ? (
                        <Box sx={fieldValueSx}>
                          <ApprovalRequestStatusChip
                            color={StatusLineColors[getReceiptTaskStatusColor(task.taskStatus, task.result)]}
                            label={value!}
                          />
                        </Box>
                      ) : (
                        <Typography
                          component="span"
                          sx={label === "SHA-256" ? [fieldValueSx, hashValueSx] : fieldValueSx}
                        >
                          {value}
                        </Typography>
                      )}
                    </Box>
                  ))}
                {task.electronicSignatureJson && (
                  <Stack spacing={StackSpacing.tight}>
                    <Box sx={fieldSx}>
                      <Typography component="span" sx={fieldLabelSx}>
                        Legal name
                      </Typography>
                      <Typography component="span" sx={fieldValueSx}>
                        {task.assigneeLegalName || "Not provided"}
                      </Typography>
                    </Box>
                    {task.assigneeRepresentationDetails && (
                      <Box sx={fieldSx}>
                        <Typography component="span" sx={fieldLabelSx}>
                          Representation details
                        </Typography>
                        <Typography component="span" sx={fieldValueSx}>
                          {task.assigneeRepresentationDetails}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={fieldSx}>
                      <Typography component="span" sx={fieldLabelSx}>
                        Electronic signature
                      </Typography>
                      <Box sx={signatureValueSx}>
                        <ReceiptSignature signatureJson={task.electronicSignatureJson} />
                      </Box>
                    </Box>
                  </Stack>
                )}
                {task.files.map((file) => (
                  <Stack key={file.globalId} spacing={StackSpacing.tight}>
                    {[
                      ["Attached file", file.fileName],
                      ["SHA-256", formatSha256(file.hashValue)],
                      ["Size", formatBytes(file.size)],
                    ].map(([label, value]) => (
                      <Box key={label} sx={fieldSx}>
                        <Typography component="span" sx={fieldLabelSx}>
                          {label}
                        </Typography>
                        <Typography
                          component="span"
                          sx={label === "SHA-256" ? [fieldValueSx, hashValueSx] : fieldValueSx}
                        >
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
        {footerContent && <Box sx={printSectionSx}>{footerContent}</Box>}
      </Stack>
    </ApprovalRequestDetailsCard>
  );
};

export default ReceiptCard;
