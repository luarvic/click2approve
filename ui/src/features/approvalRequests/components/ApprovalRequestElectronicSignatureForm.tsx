import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import { Dialogs } from "@/shared/constants/constants";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export interface ElectronicSignatureErrors {
  legalName: string;
  signature: string;
}

interface ApprovalRequestElectronicSignatureFormProps {
  errors: ElectronicSignatureErrors;
  legalName: string;
  organization: string;
  onFieldErrorClear: (field: keyof ElectronicSignatureErrors) => void;
  onLegalNameChange: (value: string) => void;
  onOrganizationChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
  showOrganization: boolean;
  signatureJson: string;
}

const electronicSignatureFormSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  borderRadius: 1,
  p: Dialogs.formStackSpacing,
});

const ApprovalRequestElectronicSignatureForm: React.FC<ApprovalRequestElectronicSignatureFormProps> = ({
  errors,
  legalName,
  organization,
  onFieldErrorClear,
  onLegalNameChange,
  onOrganizationChange,
  onSignatureChange,
  showOrganization,
  signatureJson,
}) => (
  <Box sx={electronicSignatureFormSx}>
    <Stack spacing={Dialogs.formStackSpacing}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
      >
        <DrawOutlinedIcon color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Electronic signature
        </Typography>
      </Stack>
      <Stack direction="row" spacing={Dialogs.formStackSpacing}>
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
        {showOrganization && (
          <TextField
            fullWidth
            label="Organization"
            value={organization}
            onChange={(event) => onOrganizationChange(event.target.value)}
          />
        )}
      </Stack>
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
