import { Dialogs } from "@/shared/constants/constants";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
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
      <MainActionButton endIcon={<ArrowForward />} type="submit">
        Next
      </MainActionButton>
    ) : (
      <MainActionButton loading={isSubmitting} type="submit" onClick={onSubmit}>
        Submit
      </MainActionButton>
    )}
  </Stack>
);

export default ApprovalRequestSubmitActions;
