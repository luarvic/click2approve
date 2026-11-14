import ApprovalRequestElectronicSignatureForm, {
  ElectronicSignatureErrors,
} from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { Forms } from "@/shared/components/dialogs/formStyles";
import FormCard from "@/shared/components/forms/FormCard";
import { FormControl, FormControlLabel, FormHelperText, Radio, RadioGroup, TextField } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalRequestTaskResponseFormProps {
  action?: ApprovalRequestTaskAction;
  result?: boolean;
  onResultChange: (value: boolean) => void;
  decisionError: boolean;
  attachmentError: boolean;
  attachments?: ReactNode;
  comment: string;
  commentError?: string;
  onCommentChange: (value: string) => void;
  disabled?: boolean;
  requiresElectronicSignature: boolean;
  legalName: string;
  onLegalNameChange: (value: string) => void;
  representationDetails: string;
  onRepresentationDetailsChange: (value: string) => void;
  signatureJson: string;
  onSignatureChange: (value: string) => void;
  showRepresentationDetails: boolean;
  signatureErrors: ElectronicSignatureErrors;
}

/** Shared response presentation; each access flow owns its API, validation, and attachments. */
const ApprovalRequestTaskResponseForm = ({
  action,
  result,
  onResultChange,
  decisionError,
  attachmentError,
  attachments,
  comment,
  commentError,
  onCommentChange,
  disabled = false,
  requiresElectronicSignature,
  signatureErrors,
  ...signature
}: ApprovalRequestTaskResponseFormProps) => {
  const labels = getApprovalRequestTaskActionLabels(action);
  return (
    <FormCard title="Your response">
      <FormControl fullWidth error={decisionError} disabled={disabled}>
        <RadioGroup
          aria-label="Your decision"
          row
          name="decision"
          value={typeof result === "boolean" ? String(result) : ""}
          onChange={(event) => onResultChange(event.target.value === "true")}
        >
          <FormControlLabel value="true" control={<Radio />} label={labels.positive} />
          <FormControlLabel value="false" control={<Radio />} label={labels.negative} />
        </RadioGroup>
        {decisionError && <FormHelperText sx={Forms.fieldHelperTextSx}>{labels.missing}</FormHelperText>}
      </FormControl>
      {attachments}
      {attachmentError && (
        <FormHelperText error sx={Forms.fieldHelperTextSx}>
          At least one attachment is required.
        </FormHelperText>
      )}
      <TextField
        id="comment"
        name="comment"
        fullWidth
        label="Comment"
        multiline
        disabled={disabled}
        value={comment}
        error={Boolean(commentError)}
        helperText={commentError}
        onChange={(event) => onCommentChange(event.target.value)}
      />
      {requiresElectronicSignature && (
        <ApprovalRequestElectronicSignatureForm {...signature} errors={signatureErrors} />
      )}
    </FormCard>
  );
};

export default ApprovalRequestTaskResponseForm;
