import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
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
import type { StatusLineColor } from "@/shared/components/status/StatusLines";
import { StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeWithSecondsString } from "@/shared/utils/dateTime";
import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ReceiptCardProps {
  footerContent?: ReactNode;
  headerContent?: ReactNode;
  receipt: Receipt | PublicReceipt;
  sx?: SxProps<Theme>;
  titleContent?: ReactNode;
}

const receiptContentSx: SxProps<Theme> = {
  fontFamily: "monospace",
  "& *": {
    fontFamily: "inherit",
  },
};

const headingSx: SxProps<Theme> = {
  fontFamily: "inherit",
  fontWeight: 700,
  textAlign: "center",
};

const receiptHeaderStackSpacing = 1.5;

const sectionHeadingVerticalPadding = 0.5;

const receiptSectionSpacing = StackSpacing.loose;

const sectionHeadingSx: SxProps<Theme> = {
  fontFamily: "inherit",
  fontWeight: 700,
  py: sectionHeadingVerticalPadding,
  textAlign: "center",
};

const fieldSx: SxProps<Theme> = {
  alignItems: "stretch",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 3fr)",
};

const fieldLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontFamily: "monospace",
  overflowWrap: "anywhere",
  textAlign: "right",
};

const fieldValueOffset = "0.75rem";

const fieldValueSx = {
  fontFamily: "monospace",
  minWidth: 0,
  overflowWrap: "anywhere",
  pl: fieldValueOffset,
  textAlign: "left",
} satisfies SxProps<Theme>;

const signatureValueSx: SxProps<Theme> = { minWidth: 0, pl: fieldValueOffset };

const getStatusColor = (theme: Theme, statusColor: StatusLineColor): string => {
  switch (statusColor) {
    case "canceled":
      return theme.palette.warning.main;
    case "completedSuccessfully":
    case "started":
      return theme.palette.success.main;
    case "pending":
      return theme.palette.primary.main;
    case "completedUnsuccessfully":
      return theme.palette.error.main;
    case "other":
      return theme.palette.text.disabled;
  }
};

const getStatusValueSx = (statusColor: StatusLineColor) => (theme: Theme) => ({
  textDecorationColor: getStatusColor(theme, statusColor),
  textDecorationLine: "underline",
  textDecorationThickness: "2px",
  textUnderlineOffset: "0.2em",
});

const metadataSx: SxProps<Theme> = {
  color: "text.secondary",
  fontFamily: "inherit",
  textAlign: "center",
};

const printSectionSx: SxProps<Theme> = {
  "@media print": {
    breakInside: "avoid",
    pageBreakInside: "avoid",
  },
};

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

const ReceiptCard: React.FC<ReceiptCardProps> = ({ footerContent, headerContent, receipt, sx, titleContent }) => {
  const tasks = receipt.participants.filter((participant) => participant.role === ReceiptParticipantRole.Assignee);
  const requestStatusColor = getApprovalRequestStatusLineColor(
    receipt.approvalRequestStatus,
    receipt.approvalRequestResult,
  );
  const requestFields = [
    ["Request ID", receipt.approvalRequestGlobalId],
    ["Date", getLocaleDateTimeWithSecondsString(receipt.approvalRequestCreatedAt)],
    ["Organization", receipt.organizationDisplayName || receipt.tenantDisplayName],
    ["Title", receipt.approvalRequestTitle],
    ["Revision", String(receipt.revisionNumber)],
    ["Description", receipt.approvalRequestDescription],
    ["Submitted by", receipt.createdByDisplayName],
    ["Completed at", getLocaleDateTimeWithSecondsString(getRequestCompletedAt(receipt))],
    ["Completed by", receipt.approvalRequestCompletedByDisplayName],
    ["Status", getApprovalRequestStatusLabel(receipt.approvalRequestStatus, receipt.approvalRequestResult)],
  ];

  return (
    <ApprovalRequestDetailsCard ariaLabel="Receipt" contentSx={receiptContentSx} showStatusBorder={false} sx={sx}>
      <Stack spacing={receiptSectionSpacing}>
        <Stack spacing={receiptHeaderStackSpacing} sx={printSectionSx}>
          {headerContent}
          <Stack spacing={0.5}>
            {titleContent && (
              <Typography component="h1" sx={headingSx} variant="h6">
                {titleContent}
              </Typography>
            )}
            <Box sx={fieldSx}>
              <Typography component="span" sx={fieldLabelSx}>
                Receipt ID:
              </Typography>
              <Typography component="span" sx={fieldValueSx}>
                {receipt.globalId}
              </Typography>
            </Box>
            <Box sx={fieldSx}>
              <Typography component="span" sx={fieldLabelSx}>
                Date:
              </Typography>
              <Typography component="span" sx={fieldValueSx}>
                {getLocaleDateTimeWithSecondsString(receipt.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Stack sx={printSectionSx}>
          <Stack spacing={0.5}>
            <Typography sx={sectionHeadingSx}>Request</Typography>
            {requestFields
              .filter(([, value]) => hasText(value))
              .map(([label, value]) => (
                <Box key={label} sx={fieldSx}>
                  <Typography component="span" sx={fieldLabelSx}>
                    {label}:
                  </Typography>
                  {label === "Status" ? (
                    <Typography component="span" sx={[fieldValueSx, getStatusValueSx(requestStatusColor)]}>
                      {value}
                    </Typography>
                  ) : (
                    <Typography component="span" sx={fieldValueSx}>
                      {value}
                    </Typography>
                  )}
                </Box>
              ))}
            {receipt.files.map((file) => (
              <Stack key={file.globalId} spacing={0.5}>
                {[
                  ["Attached file", file.fileName],
                  ["SHA-256", formatSha256(file.hashValue)],
                  ["Size", formatBytes(file.size)],
                ].map(([label, value]) => (
                  <Box key={label} sx={fieldSx}>
                    <Typography component="span" sx={fieldLabelSx}>
                      {label}:
                    </Typography>
                    <Typography component="span" sx={fieldValueSx}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack spacing={receiptSectionSpacing}>
          {tasks.length === 0 && <Typography sx={metadataSx}>No completed tasks were recorded.</Typography>}
          <Stack spacing={receiptSectionSpacing}>
            {tasks.map((task, index) => (
              <Stack
                key={`${task.email}-${task.completedAt?.toISOString() ?? index}`}
                spacing={0.5}
                sx={printSectionSx}
              >
                <Typography sx={sectionHeadingSx}>Task</Typography>
                {[
                  ["Task ID", task.taskGlobalId],
                  ["Date", getLocaleDateTimeWithSecondsString(task.assignedAt)],
                  ["Organization", task.isAssigneeEmployee ? task.organizationDisplayName : undefined],
                  ["Action", task.action],
                  ["Instructions", task.instructions],
                  ["Assigned to", task.displayName],
                  ["Completed at", getLocaleDateTimeWithSecondsString(task.completedAt)],
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
                        {label}:
                      </Typography>
                      {label === "Status" ? (
                        <Typography
                          component="span"
                          sx={[fieldValueSx, getStatusValueSx(getReceiptTaskStatusColor(task.taskStatus, task.result))]}
                        >
                          {value}
                        </Typography>
                      ) : (
                        <Typography component="span" sx={fieldValueSx}>
                          {value}
                        </Typography>
                      )}
                    </Box>
                  ))}
                {task.electronicSignatureJson && (
                  <Stack spacing={0.5}>
                    <Box sx={fieldSx}>
                      <Typography component="span" sx={fieldLabelSx}>
                        Legal name:
                      </Typography>
                      <Typography component="span" sx={fieldValueSx}>
                        {task.assigneeLegalName || "Not provided"}
                      </Typography>
                    </Box>
                    {task.assigneeRepresentationDetails && (
                      <Box sx={fieldSx}>
                        <Typography component="span" sx={fieldLabelSx}>
                          Representation details:
                        </Typography>
                        <Typography component="span" sx={fieldValueSx}>
                          {task.assigneeRepresentationDetails}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={fieldSx}>
                      <Typography component="span" sx={fieldLabelSx}>
                        Electronic signature:
                      </Typography>
                      <Box sx={signatureValueSx}>
                        <ReceiptSignature signatureJson={task.electronicSignatureJson} />
                      </Box>
                    </Box>
                  </Stack>
                )}
                {task.files.map((file) => (
                  <Stack key={file.globalId} spacing={0.5}>
                    {[
                      ["Attached file", file.fileName],
                      ["SHA-256", formatSha256(file.hashValue)],
                      ["Size", formatBytes(file.size)],
                    ].map(([label, value]) => (
                      <Box key={label} sx={fieldSx}>
                        <Typography component="span" sx={fieldLabelSx}>
                          {label}:
                        </Typography>
                        <Typography component="span" sx={fieldValueSx}>
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
