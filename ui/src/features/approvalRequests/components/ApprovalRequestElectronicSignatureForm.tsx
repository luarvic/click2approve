import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import FormSection from "@/shared/components/forms/FormSection";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { InputAdornment, TextField } from "@mui/material";

export interface ElectronicSignatureErrors {
  legalName: string;
  representationDetails?: string;
  signature: string;
}

interface ApprovalRequestElectronicSignatureFormProps {
  errors: ElectronicSignatureErrors;
  legalName: string;
  representationDetails: string;
  onLegalNameChange: (value: string) => void;
  onRepresentationDetailsChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  showRepresentationDetails: boolean;
  signatureJson: string;
}

const ApprovalRequestElectronicSignatureForm: React.FC<ApprovalRequestElectronicSignatureFormProps> = ({
  errors,
  legalName,
  representationDetails,
  onLegalNameChange,
  onRepresentationDetailsChange,
  onSignatureChange,
  showRepresentationDetails,
  signatureJson,
}) => (
  <FormSection title="Electronic signature">
    <TextField
      error={Boolean(errors.legalName)}
      fullWidth
      helperText={errors.legalName}
      label="Legal name"
      required
      value={legalName}
      onChange={(event) => onLegalNameChange(event.target.value)}
    />
    {showRepresentationDetails && (
      <TextField
        fullWidth
        label="Representation details"
        error={Boolean(errors.representationDetails)}
        helperText={errors.representationDetails}
        multiline
        value={representationDetails}
        onChange={(event) => onRepresentationDetailsChange(event.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <HelpPopover
                  docsHref="/docs/complete-a-task/"
                  helpText="Identify the organization or person you represent when signing."
                />
              </InputAdornment>
            ),
          },
        }}
      />
    )}
    <ApprovalRequestSignatureField
      error={Boolean(errors.signature)}
      helperText={errors.signature}
      onChange={onSignatureChange}
      value={signatureJson}
    />
  </FormSection>
);

export default ApprovalRequestElectronicSignatureForm;
