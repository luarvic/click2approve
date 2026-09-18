import { getMfaStatus } from "@/features/identity/api/mfaApi";
import MfaSettingsDialog from "@/features/identity/components/MfaSettingsDialog";
import { MfaStatus } from "@/features/identity/models/mfa";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Alert, Button, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

const MfaSettings = () => {
  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<"setup" | "disable" | "recovery" | null>(null);
  const { isRunning, run } = useAsyncAction(ActionLoaders.identity.loadMfa());
  const load = useCallback(async () => {
    await run(async () => {
      const value = await getMfaStatus();
      setStatus(value);
      setFailed(!value);
    });
  }, [run]);
  useEffect(() => {
    void load();
  }, [load]);
  if (failed)
    return (
      <Alert
        severity="error"
        action={
          <Button disabled={isRunning} onClick={load}>
            Retry
          </Button>
        }
      >
        Unable to load security settings.
      </Alert>
    );
  if (!status) return <Typography>Loading security settings…</Typography>;
  return (
    <Stack spacing={Forms.formStackSpacing}>
      <Typography color="text.secondary">
        Protect your account with a code from an authenticator app in addition to your password.
      </Typography>
      <FormControlLabel
        label="Use multi-factor authentication"
        control={
          <Checkbox
            checked={status.enabled}
            disabled={!status.isAvailable || mode !== null}
            onChange={(_, checked) => setMode(checked ? "setup" : "disable")}
          />
        }
      />
      {!status.isAvailable && (
        <Alert severity="info">Multi-factor authentication is unavailable in this environment.</Alert>
      )}
      {status.enabled && status.isAvailable && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
          <MainActionButton type="button" onClick={() => setMode("recovery")}>
            Generate new recovery codes
          </MainActionButton>
        </Stack>
      )}
      {mode && <MfaSettingsDialog mode={mode} onClose={() => setMode(null)} />}
    </Stack>
  );
};
export default MfaSettings;
