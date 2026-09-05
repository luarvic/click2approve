import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import { Forms } from "@/shared/components/dialogs/formStyles";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import { Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

export interface ElectronicSignatureErrors {
  legalName: string;
  signature: string;
}

interface ApprovalRequestElectronicSignatureFormProps {
  errors: ElectronicSignatureErrors;
  legalName: string;
  representationDetails: string;
  onFieldErrorClear: (field: keyof ElectronicSignatureErrors) => void;
  onLegalNameChange: (value: string) => void;
  onRepresentationDetailsChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  showRepresentationDetails: boolean;
  signatureJson: string;
}

const electronicSignatureFormSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  borderRadius: 1,
  p: Forms.formStackSpacing,
});

const ApprovalRequestElectronicSignatureForm: React.FC<ApprovalRequestElectronicSignatureFormProps> = ({
  errors,
  legalName,
  representationDetails,
  onFieldErrorClear,
  onLegalNameChange,
  onRepresentationDetailsChange,
  onSignatureChange,
  showRepresentationDetails,
  signatureJson,
}) => (
  <Box sx={electronicSignatureFormSx}>
    <Stack spacing={Forms.formStackSpacing}>
      <Stack alignItems="center" direction="row" spacing={Forms.actionSpacing}>
        <DrawOutlinedIcon color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Electronic signature
        </Typography>
      </Stack>
      <Stack direction="row" spacing={Forms.formStackSpacing}>
        <TextField
          error={Boolean(errors.legalName)}
          fullWidth
          helperText={errors.legalName}
          label="Legal name"
          required
          value={legalName}
          onChange={(event) => {
            onLegalNameChange(event.target.value);
            onFieldErrorClear("legalName");
          }}
        />
      </Stack>
      {showRepresentationDetails && (
        <TextField
          fullWidth
          label="Representation details"
          multiline
          value={representationDetails}
          onChange={(event) => onRepresentationDetailsChange(event.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <HelpPopover helpText="Add an organization name, address, or other context about who or what you represent when signing." />
              </InputAdornment>
            ),
          }}
        />
      )}
      <ApprovalRequestSignatureField
        error={Boolean(errors.signature)}
        helperText={errors.signature}
        onChange={onSignatureChange}
        value={signatureJson}
      />
    </Stack>
  </Box>
);

export default ApprovalRequestElectronicSignatureForm;
