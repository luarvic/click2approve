import { Link } from "@mui/material";

const AnalyticsSettingsButton = () =>
  import.meta.env.GOOGLE_ANALYTICS_ID ? (
    <Link
      component="button"
      type="button"
      data-analytics-settings
      color="inherit"
      underline="hover"
      sx={{
        fontSize: "11px",
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "4px" },
      }}
    >
      Analytics settings
    </Link>
  ) : null;

export default AnalyticsSettingsButton;
