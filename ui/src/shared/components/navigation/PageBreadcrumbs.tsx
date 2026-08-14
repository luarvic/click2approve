import { Pages } from "@/shared/constants/constants";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export interface PageBreadcrumbItem {
  label: string;
  onClick?: () => void;
  state?: unknown;
  titleAction?: ReactNode;
  to?: string;
}

interface PageBreadcrumbsProps {
  items: PageBreadcrumbItem[];
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = ({ items }) => (
  <Breadcrumbs aria-label="Breadcrumb" sx={Pages.titleSx}>
    {items.map((item, index) => {
      const to = item.to;
      const isCurrent = index === items.length - 1 || (!to && !item.onClick);
      return isCurrent ? (
        <Typography
          key={`${item.label}-${index}`}
          component={index === items.length - 1 ? "h1" : "span"}
          variant="h5"
          sx={Pages.breadcrumbCurrentSx}
        >
          {item.label}
          {item.titleAction}
        </Typography>
      ) : (
        <Link
          key={`${item.label}-${index}`}
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
          to={to ?? "#"}
          variant="h5"
          sx={Pages.breadcrumbLinkSx}
        >
          {item.label}
        </Link>
      );
    })}
  </Breadcrumbs>
);

export default PageBreadcrumbs;
