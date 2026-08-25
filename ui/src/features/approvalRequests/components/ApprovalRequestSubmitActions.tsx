import { Dialogs } from "@/shared/constants/constants";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { ArrowBack } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

interface ApprovalRequestSubmitActionsProps {
  isSavingTemplate: boolean;
  isSubmitting: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  onSaveTemplate?: () => void;
  onSubmit?: () => void;
}

const ApprovalRequestSubmitActions: React.FC<ApprovalRequestSubmitActionsProps> = ({
  isSavingTemplate,
  isSubmitting,
  onBack,
  onCancel,
  onSaveTemplate,
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
    {onSaveTemplate && (
      <Button disabled={isSavingTemplate} variant="outlined" onClick={onSaveTemplate}>
        Save template
      </Button>
    )}
    <MainActionButton loading={isSubmitting} type="submit" onClick={onSubmit}>
      Submit
    </MainActionButton>
  </Stack>
);

export default ApprovalRequestSubmitActions;
