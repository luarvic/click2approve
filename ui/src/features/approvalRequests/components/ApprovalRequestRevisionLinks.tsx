import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { Routes } from "@/shared/constants/constants";
import { Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface ApprovalRequestRevisionLinksProps {
  nextRevisionApprovalRequestGlobalId?: string;
  previousRevisionApprovalRequestGlobalId?: string;
  tenantGlobalId?: string | null;
}

const ApprovalRequestRevisionLinks: React.FC<ApprovalRequestRevisionLinksProps> = ({
  nextRevisionApprovalRequestGlobalId,
  previousRevisionApprovalRequestGlobalId,
  tenantGlobalId,
}) => {
  if (!tenantGlobalId || (!previousRevisionApprovalRequestGlobalId && !nextRevisionApprovalRequestGlobalId)) {
    return null;
  }

  const getRequestPath = (globalId: string) => Routes.tenantPath(tenantGlobalId, `/outbox/${globalId}`);

  return (
    <Typography color="text.secondary" variant="body2">
      {previousRevisionApprovalRequestGlobalId && (
        <>
          Supersedes{" "}
          <Link color="inherit" component={RouterLink} to={getRequestPath(previousRevisionApprovalRequestGlobalId)}>
            {getApprovalRequestNumber(previousRevisionApprovalRequestGlobalId)}
          </Link>
        </>
      )}
      {previousRevisionApprovalRequestGlobalId && nextRevisionApprovalRequestGlobalId && " | "}
      {nextRevisionApprovalRequestGlobalId && (
        <>
          Superseded by{" "}
          <Link color="inherit" component={RouterLink} to={getRequestPath(nextRevisionApprovalRequestGlobalId)}>
            {getApprovalRequestNumber(nextRevisionApprovalRequestGlobalId)}
          </Link>
        </>
      )}
    </Typography>
  );
};

export default ApprovalRequestRevisionLinks;
