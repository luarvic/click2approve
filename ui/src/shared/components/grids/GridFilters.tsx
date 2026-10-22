import GridFilterBar from "@/shared/components/grids/GridFilterBar";
import type { GridFilterFieldProps } from "@/shared/components/grids/GridFilterField";

interface GridFiltersProps {
  fields: GridFilterFieldProps[];
}

const GridFilters: React.FC<GridFiltersProps> = ({ fields }) => (
  <GridFilterBar
    items={fields.map((field) =>
      field.multiple
        ? {
            ...field,
            onChange: field.onChange as (value: string[]) => void,
            options: field.options!,
            type: "multiSelect" as const,
            value: field.value as string[],
          }
        : {
            ...field,
            onChange: field.onChange as (value: string) => void,
            type: "text" as const,
            value: field.value as string,
          },
    )}
  />
);

export default GridFilters;
