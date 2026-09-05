import { FilterStyles } from "@/shared/components/grids/filterStyles";
import type { GridFilterOption } from "@/shared/components/grids/GridFilterField";
import GridFilterField from "@/shared/components/grids/GridFilterField";
import { Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

export type GridFilterItem =
  | {
      label: string;
      onChange: (value: string) => void;
      type: "text";
      value: string;
    }
  | {
      label: string;
      onChange: (value: string[]) => void;
      options: GridFilterOption[];
      type: "multiSelect";
      value: string[];
    }
  | {
      label: string;
      onChange: (value: Dayjs | null) => void;
      type: "date";
      value: Dayjs | null;
    };

interface GridFilterBarProps {
  items: GridFilterItem[];
}

const filterStackSpacing = 2;

/** Renders a consistently sized, responsive collection of grid filters. */
const GridFilterBar: React.FC<GridFilterBarProps> = ({ items }) => (
  <Stack direction={{ xs: "column", md: "row" }} flexWrap="wrap" spacing={filterStackSpacing} useFlexGap>
    {items.map((item) => {
      switch (item.type) {
        case "date":
          return (
            <DatePicker
              key={item.label}
              label={item.label}
              slotProps={{
                field: { clearable: true },
                textField: { size: "small", sx: FilterStyles.multiSelectSx, variant: "outlined" },
              }}
              value={item.value}
              onChange={item.onChange}
            />
          );
        case "multiSelect":
          return (
            <GridFilterField
              key={item.label}
              label={item.label}
              multiple
              options={item.options}
              value={item.value}
              onChange={item.onChange}
            />
          );
        case "text":
          return <GridFilterField key={item.label} label={item.label} value={item.value} onChange={item.onChange} />;
      }
    })}
  </Stack>
);

export default GridFilterBar;
