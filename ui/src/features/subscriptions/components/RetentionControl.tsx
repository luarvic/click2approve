import { Forms } from "@/shared/components/dialogs/formStyles";
import {
  Slider,
  SliderValueLabel,
  Stack,
  Typography,
  type SliderValueLabelProps,
  type SxProps,
  type Theme,
} from "@mui/material";

const retentionOptions = [1, 3, 6, 9, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 0];
const retentionMarks = retentionOptions.map((_, index) => ({
  label:
    index === 0 ? (
      <span className="retention-first-mark-label">1 month</span>
    ) : index === retentionOptions.length - 1 ? (
      <span className="retention-last-mark-label">Never delete</span>
    ) : undefined,
  value: index,
}));

const getRetentionLabel = (months: number) => {
  if (months === 0) {
    return "Never delete";
  }

  if (months % 12 === 0) {
    const years = months / 12;

    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${months} month${months === 1 ? "" : "s"}`;
};
const getRetentionValue = (months: number) => Math.max(0, retentionOptions.indexOf(months));
const retentionSliderSx: SxProps<Theme> = {
  flexGrow: 1,
  "& .MuiSlider-valueLabel": {
    fontSize: "0.625rem",
    px: 0.5,
    py: 0.25,
  },
  "& .retention-first-mark-label, & .retention-last-mark-label": {
    color: "text.secondary",
    display: "inline-block",
  },
  "& .retention-first-mark-label": {
    transform: "translateX(50%)",
  },
  "& .retention-last-mark-label": {
    transform: "translateX(-50%)",
  },
};
const retentionTitleSx: SxProps<Theme> = { flexShrink: 0, width: "8rem" };

interface RetentionControlProps {
  disabled: boolean;
  label: string;
  months: number;
  onChange: (months: number) => void;
}

const RetentionValueLabel: React.FC<SliderValueLabelProps> = ({ children, value, ...props }) => {
  const formattedValue = value as unknown as string;

  if (formattedValue === "1 month" || formattedValue === "Never delete") {
    return children;
  }

  return (
    <SliderValueLabel {...props} value={value}>
      {children}
    </SliderValueLabel>
  );
};

const RetentionControl: React.FC<RetentionControlProps> = ({ disabled, label, months, onChange }) => (
  <Stack alignItems="center" direction="row" spacing={Forms.actionSpacing}>
    <Typography id={`${label}-retention`} sx={retentionTitleSx}>
      {label}
    </Typography>
    <Slider
      aria-labelledby={`${label}-retention`}
      disabled={disabled}
      marks={retentionMarks}
      max={retentionOptions.length - 1}
      min={0}
      onChange={(_, value) => onChange(retentionOptions[value as number])}
      step={1}
      sx={retentionSliderSx}
      slots={{ valueLabel: RetentionValueLabel }}
      value={getRetentionValue(months)}
      valueLabelDisplay="on"
      valueLabelFormat={(value) => getRetentionLabel(retentionOptions[value])}
    />
  </Stack>
);

export default RetentionControl;
