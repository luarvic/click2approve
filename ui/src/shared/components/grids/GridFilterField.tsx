import { FilterStyles } from "@/shared/components/grids/filterStyles";
import { Filters } from "@/shared/config/application";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Autocomplete, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export interface GridFilterOption {
  label: string;
  value: string;
}

export interface GridFilterFieldProps {
  label: string;
  multiple?: boolean;
  onChange: (value: any) => void;
  options?: GridFilterOption[];
  value: string | string[];
}

/** Renders a consistently styled grid filter, debouncing free-text values. */
const GridFilterField: React.FC<GridFilterFieldProps> = (props) => {
  const { label, multiple = false, onChange, options, value } = props;
  const [textValue, setTextValue] = useState(typeof value === "string" ? value : "");
  const debouncedTextValue = useDebouncedValue(textValue, Filters.textInputDebounceMs);

  useEffect(() => {
    if (typeof value === "string") setTextValue(value);
  }, [value]);

  useEffect(() => {
    if (!options && typeof value === "string" && debouncedTextValue !== value) {
      onChange(debouncedTextValue);
    }
  }, [debouncedTextValue, onChange, options, value]);

  if (multiple) {
    return (
      <Autocomplete
        multiple
        options={options ?? []}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, selected) => option.value === selected.value}
        onChange={(_event, selected) => onChange(selected.map((option) => option.value))}
        renderInput={(params) => <TextField {...params} label={label} size="small" variant="outlined" />}
        size="small"
        sx={FilterStyles.multiSelectSx}
        value={(options ?? []).filter((option) => (value as string[]).includes(option.value))}
      />
    );
  }

  return (
    <TextField
      label={label}
      onChange={(event) => (options ? onChange(event.target.value) : setTextValue(event.target.value))}
      select={Boolean(options)}
      size="small"
      sx={FilterStyles.multiSelectSx}
      value={options ? value : textValue}
      variant="outlined"
    >
      {options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default GridFilterField;
