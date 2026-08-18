import { Dialogs } from "@/shared/constants/constants";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack } from "@mui/material";

interface ApprovalRequestSubmitActionsProps {
  canContinue: boolean;
  isSubmitting: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
}

const ApprovalRequestSubmitActions: React.FC<ApprovalRequestSubmitActionsProps> = ({
  canContinue,
  isSubmitting,
  onBack,
  onCancel,
  onSubmit,
}) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
    {onBack ? (
      <Button startIcon={<ArrowBack />} onClick={onBack}>
        Back
      </Button>
    ) : (
      <Button variant="outlined" onClick={onCancel}>
        Cancel
      </Button>
    )}
    {canContinue ? (
      <Button endIcon={<ArrowForward />} type="submit">
        Next
      </Button>
    ) : (
      <LoadingButton loading={isSubmitting} type="submit" variant="outlined" onClick={onSubmit}>
        Submit
      </LoadingButton>
    )}
  </Stack>
);

export default ApprovalRequestSubmitActions;
