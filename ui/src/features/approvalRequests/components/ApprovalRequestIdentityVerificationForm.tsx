import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import { Dialogs } from "@/shared/constants/constants";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { Box, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

export interface IdentityVerificationErrors {
  dateOfBirth: string;
  legalName: string;
  signature: string;
}

interface ApprovalRequestIdentityVerificationFormProps {
  dateOfBirth: string;
  errors: IdentityVerificationErrors;
  legalName: string;
  onDateOfBirthChange: (value: string) => void;
  onFieldErrorClear: (field: keyof IdentityVerificationErrors) => void;
  onLegalNameChange: (value: string) => void;
  onSignatureChange: (value: string) => void;
}

const identityVerificationFieldDirection = { xs: "column", md: "row" } as const;
const dateOfBirthFormat = "YYYY-MM-DD";
const identityVerificationFormSx: SxProps<Theme> = (theme) => ({
  backgroundColor: alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.12 : 0.04),
  borderRadius: 1,
  p: Dialogs.formStackSpacing,
});

const ApprovalRequestIdentityVerificationForm: React.FC<ApprovalRequestIdentityVerificationFormProps> = ({
  dateOfBirth,
  errors,
  legalName,
  onDateOfBirthChange,
  onFieldErrorClear,
  onLegalNameChange,
  onSignatureChange,
}) => (
  <Box sx={identityVerificationFormSx}>
    <Stack spacing={Dialogs.formStackSpacing}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={Dialogs.stepHeaderSpacing}
      >
        <VerifiedUserOutlinedIcon color="secondary" />
        <Typography color="secondary" variant="subtitle1">
          Identity verification
        </Typography>
      </Stack>
      <Stack
        direction={identityVerificationFieldDirection}
        spacing={Dialogs.stepHeaderSpacing}
      >
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of birth"
            maxDate={dayjs().subtract(1, "day")}
            value={dateOfBirth ? dayjs(dateOfBirth) : null}
            onChange={(value) => {
              onDateOfBirthChange(value?.isValid() ? value.format(dateOfBirthFormat) : "");
              onFieldErrorClear("dateOfBirth");
            }}
            slotProps={{
              textField: {
                error: Boolean(errors.dateOfBirth),
                fullWidth: true,
                helperText: errors.dateOfBirth,
                required: true,
              },
            }}
          />
        </LocalizationProvider>
      </Stack>
      <ApprovalRequestSignatureField
        error={Boolean(errors.signature)}
        helperText={errors.signature}
        onChange={onSignatureChange}
      />
    </Stack>
  </Box>
);

export default ApprovalRequestIdentityVerificationForm;
