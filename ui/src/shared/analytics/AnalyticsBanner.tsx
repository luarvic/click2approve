import { AnalyticsPage } from "@/shared/analytics/analyticsPages";
import {
  AnalyticsPreference,
  analyticsPreferenceKey,
  readAnalyticsPreference,
  saveAnalyticsPreference,
} from "@/shared/analytics/analyticsPreferences";
import { createAnalyticsTracking } from "@/shared/analytics/analyticsTracking";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import { Box, FormControlLabel, IconButton, Link, Paper, Switch, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface AnalyticsBannerProps {
  measurementId?: string;
  publicPage?: AnalyticsPage;
}

/** One optional consent choice for the app, landing page, and documentation. */
const AnalyticsBanner = ({ measurementId = "", publicPage }: AnalyticsBannerProps) => {
  const id = /^G-[A-Z0-9]+$/.test(measurementId) ? measurementId : "";
  const [saved, setSaved] = useState<AnalyticsPreference | null>(() => (id ? readAnalyticsPreference(id) : null));
  const [open, setOpen] = useState(saved === null);
  const tracking = useRef<ReturnType<typeof createAnalyticsTracking> | null>(null);
  const switchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const instance = createAnalyticsTracking(id, publicPage);
    tracking.current = instance;
    return () => {
      instance.dispose();
      tracking.current = null;
    };
  }, [id, publicPage]);

  useEffect(() => {
    tracking.current?.setEnabled(saved?.choice === "accepted" && saved.expiresAt > Date.now());
    if (!saved) return;
    let timer: ReturnType<typeof setTimeout>;
    const checkExpiry = () => {
      const remaining = saved.expiresAt - Date.now();
      if (remaining <= 0) {
        setSaved(null);
        setOpen(true);
      } else timer = setTimeout(checkExpiry, Math.min(remaining, 24 * 60 * 60 * 1000));
    };
    checkExpiry();
    return () => clearTimeout(timer);
  }, [saved]);

  useEffect(() => {
    if (!id) return;
    const synchronize = () => {
      const next = readAnalyticsPreference(id);
      setSaved(next);
      setOpen(next === null);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === analyticsPreferenceKey(id) || event.key === null) synchronize();
    };
    const onSettings = (event: MouseEvent) => {
      if ((event.target as Element)?.closest?.("[data-analytics-settings]")) {
        setOpen(true);
        requestAnimationFrame(() => switchInput.current?.focus());
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", synchronize);
    document.addEventListener("click", onSettings);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", synchronize);
      document.removeEventListener("click", onSettings);
    };
  }, [id]);

  const close = () => {
    if (!saved) setSaved(saveAnalyticsPreference(id, false));
    setOpen(false);
    document.querySelector<HTMLButtonElement>("[data-analytics-settings]")?.focus();
  };
  if (!id || !open) return null;

  return (
    <Paper
      id="analytics-consent"
      component="section"
      role="region"
      aria-labelledby="analytics-consent-title"
      elevation={0}
      sx={{
        position: "fixed",
        zIndex: (theme) => theme.zIndex.snackbar,
        bottom: 16,
        left: 16,
        right: 16,
        mx: "auto",
        maxWidth: 640,
        maxHeight: "calc(100dvh - 32px)",
        overflowY: "auto",
        boxSizing: "border-box",
        p: "20px",
        border: 1,
        borderColor: "divider",
        borderRadius: "12px",
        bgcolor: "background.paper",
        color: "text.primary",
        fontFamily: "Sora, sans-serif",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
        <Typography id="analytics-consent-title" component="h2" sx={{ fontSize: "18px", fontWeight: 500 }}>
          Optional analytics
        </Typography>
        <IconButton aria-label="Close analytics settings" size="small" onClick={close}>
          <CloseOutlined sx={{ fontSize: "20px" }} />
        </IconButton>
      </Box>
      <Typography component="p" sx={{ fontSize: "14px", lineHeight: 1.6, mb: 1 }}>
        Allow Google Analytics cookies to help us understand visits and app usage. Your choice does not affect access to
        the service.{" "}
        <Link href="/privacy/" underline="always">
          Privacy Policy
        </Link>
      </Typography>
      <FormControlLabel
        sx={{ m: 0, gap: 1, "& .MuiFormControlLabel-label": { fontSize: "14px" } }}
        control={
          <Switch
            checked={saved?.choice === "accepted"}
            onChange={(_, checked) => setSaved(saveAnalyticsPreference(id, checked))}
            slotProps={{ input: { ref: switchInput, role: "switch", "aria-label": "Allow analytics" } }}
          />
        }
        label="Allow analytics"
      />
    </Paper>
  );
};

export default AnalyticsBanner;
