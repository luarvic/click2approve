import CardHeading, { type CardHeadingVariant } from "@/shared/components/papers/CardHeading";
import { StackSpacing } from "@/shared/theme/tokens";
import { ExpandMore } from "@mui/icons-material";
import { Collapse, IconButton, Stack } from "@mui/material";
import { useId, useState, type ReactNode } from "react";

interface ExpandableSectionProps {
  actions?: ReactNode;
  children: ReactNode;
  compactHeader?: boolean;
  defaultExpanded?: boolean;
  expandable?: boolean;
  headerSpacing?: number;
  headingId?: string;
  headingVariant?: CardHeadingVariant;
  title: string;
}

const headerRowSx = {
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  flexWrap: "wrap",
} as const;
const headerActionsSx = { alignItems: "center", flexShrink: 0, ml: "auto", maxWidth: "100%" } as const;
const compactHeaderActionsSx = { my: -1 } as const;
const expandIconSx = (expanded: boolean) => ({ transform: expanded ? "rotate(180deg)" : "none" });

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  actions,
  children,
  compactHeader = false,
  defaultExpanded = true,
  expandable = true,
  headerSpacing = StackSpacing.default,
  headingId,
  headingVariant,
  title,
}) => {
  const contentId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <Stack spacing={headerSpacing}>
      <Stack direction="row" spacing={StackSpacing.tight} useFlexGap={compactHeader} sx={headerRowSx}>
        <CardHeading id={headingId} variant={headingVariant}>
          {title}
        </CardHeading>
        <Stack
          direction="row"
          spacing={StackSpacing.default}
          sx={[headerActionsSx, compactHeader && compactHeaderActionsSx]}
        >
          {actions}
          {expandable && (
            <IconButton
              aria-controls={contentId}
              aria-expanded={expanded}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${title}`}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((current) => !current);
              }}
            >
              <ExpandMore sx={expandIconSx(expanded)} />
            </IconButton>
          )}
        </Stack>
      </Stack>
      {expandable ? (
        <Collapse id={contentId} in={expanded} unmountOnExit>
          {children}
        </Collapse>
      ) : (
        children
      )}
    </Stack>
  );
};

export default ExpandableSection;
