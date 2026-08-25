import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { Routes, StackSpacing } from "@/shared/constants/constants";
import { Divider, Link, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

interface ApprovalRequestRevisionLinksProps {
  leadingDivider?: boolean;
  nextRevisionApprovalRequestGlobalId?: string;
  previousRevisionApprovalRequestGlobalId?: string;
  tenantGlobalId?: string | null;
}

const revisionLinksSx: SxProps<Theme> = {
  display: "inline-flex",
};

const ApprovalRequestRevisionLinks: React.FC<ApprovalRequestRevisionLinksProps> = ({
  leadingDivider = false,
  nextRevisionApprovalRequestGlobalId,
  previousRevisionApprovalRequestGlobalId,
  tenantGlobalId,
}) => {
  if (!tenantGlobalId || (!previousRevisionApprovalRequestGlobalId && !nextRevisionApprovalRequestGlobalId)) {
    return null;
  }

  const getRequestPath = (globalId: string) => Routes.tenantPath(tenantGlobalId, `/requests/${globalId}`);

  return (
    <Stack component="span" direction="row" spacing={StackSpacing.tight} alignItems="center" sx={revisionLinksSx}>
      {leadingDivider && <Divider flexItem orientation="vertical" />}
      {previousRevisionApprovalRequestGlobalId && (
        <Typography color="text.secondary" component="span" variant="body2">
          Supersedes{" "}
          <Link component={RouterLink} to={getRequestPath(previousRevisionApprovalRequestGlobalId)}>
            {getApprovalRequestNumber(previousRevisionApprovalRequestGlobalId)}
          </Link>
        </Typography>
      )}
      {previousRevisionApprovalRequestGlobalId && nextRevisionApprovalRequestGlobalId && (
        <Divider flexItem orientation="vertical" />
      )}
      {nextRevisionApprovalRequestGlobalId && (
        <Typography color="text.secondary" component="span" variant="body2">
          Superseded by{" "}
          <Link component={RouterLink} to={getRequestPath(nextRevisionApprovalRequestGlobalId)}>
            {getApprovalRequestNumber(nextRevisionApprovalRequestGlobalId)}
          </Link>
        </Typography>
      )}
    </Stack>
  );
};

export default ApprovalRequestRevisionLinks;
