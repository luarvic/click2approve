import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { Flex } from "@/shared/components/layout/flexStyles";
import { Routes } from "@/shared/routing/routes";
import { StackSpacing } from "@/shared/theme/tokens";
import { Divider, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface ApprovalRequestRevisionLinksProps {
  leadingDivider?: boolean;
  nextRevisionApprovalRequestGlobalId?: string;
  previousRevisionApprovalRequestGlobalId?: string;
  tenantGlobalId?: string | null;
}

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
    <Stack component="span" direction="row" spacing={StackSpacing.tight} sx={Flex.inlineCenterSx}>
      {leadingDivider && <Divider flexItem orientation="vertical" />}
      {previousRevisionApprovalRequestGlobalId && (
        <Typography component="span" variant="body2" color="text.secondary">
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
        <Typography component="span" variant="body2" color="text.secondary">
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
