import AnalyticsBanner from "@/shared/analytics/AnalyticsBanner";
import { createAppTheme } from "@/shared/theme/createAppTheme";
import { PaletteMode, ThemeProvider } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const bootstrap = document.getElementById("analytics-bootstrap");
const id = bootstrap?.dataset.analyticsId || "";
const publicPage = { path: bootstrap?.dataset.pagePath || "/", title: document.title };
const mode = (): PaletteMode => (document.body.dataset.mdColorScheme === "slate" ? "dark" : "light");

const DocumentationAnalytics = () => {
  const [colorMode, setColorMode] = useState(mode);
  const theme = useMemo(() => createAppTheme(colorMode), [colorMode]);
  useEffect(() => {
    const observer = new MutationObserver(() => setColorMode(mode()));
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-md-color-scheme"] });
    return () => observer.disconnect();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <AnalyticsBanner measurementId={id} publicPage={publicPage} />
    </ThemeProvider>
  );
};

const mount = document.getElementById("analytics-root");
if (mount && id) createRoot(mount).render(<DocumentationAnalytics />);
