import { Pages } from "@/shared/components/layout/pageStyles";
import { Box, Breadcrumbs, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export interface PageBreadcrumbItem {
  label: string;
  onClick?: () => void;
  state?: unknown;
  to?: string;
}

interface PageBreadcrumbsProps {
  align?: "left" | "center";
  items: PageBreadcrumbItem[];
  subtitle?: string;
}

const headingSpacing = 0.5;
const centeredHeaderSx = { textAlign: "center", alignItems: "center" } as const;
const titleLabelSx = { minWidth: 0, overflowWrap: "anywhere" } as const;
const breadcrumbTrailSx = {
  typography: "overline",
  "& .MuiBreadcrumbs-ol": { rowGap: 0.5 },
} as const;

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({ align = "left", items, subtitle }) => {
  const currentItem = items[items.length - 1];
  const parentItems = items.slice(0, -1);

  if (!currentItem) {
    return null;
  }

  return (
    <Stack spacing={headingSpacing} sx={[Pages.titleSx, align === "center" && centeredHeaderSx]}>
      {parentItems.length > 0 && (
        <Breadcrumbs aria-label="Breadcrumb" sx={breadcrumbTrailSx}>
          {parentItems.map((item, index) => (
            <Box key={`${item.label}-${index}`} component="span">
              {item.to || item.onClick ? (
                <Link
                  component={RouterLink}
                  onClick={
                    item.onClick
                      ? (event) => {
                          event.preventDefault();
                          item.onClick?.();
                        }
                      : undefined
                  }
                  state={item.state}
                  to={item.to ?? "#"}
                  variant="inherit"
                  sx={Pages.breadcrumbLinkSx}
                >
                  {item.label}
                </Link>
              ) : (
                <Typography color="textSecondary" variant="inherit">
                  {item.label}
                </Typography>
              )}
            </Box>
          ))}
        </Breadcrumbs>
      )}
      <Typography component="h1" variant="h5" sx={Pages.breadcrumbCurrentSx}>
        <Box component="span" sx={titleLabelSx}>
          {currentItem.label}
        </Box>
      </Typography>
      {subtitle && <Typography color="textSecondary">{subtitle}</Typography>}
    </Stack>
  );
};

export default PageBreadcrumbs;
