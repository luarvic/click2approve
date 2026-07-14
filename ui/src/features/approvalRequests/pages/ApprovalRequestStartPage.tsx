import { stores } from "@/app/rootStore";
import { TenantType } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Dialogs, Pages, Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import type { SxProps } from "@mui/material";
import {
  Button,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const continueButtonSx: SxProps<Theme> = { alignSelf: "flex-start" };

type RequestType = "custom" | "template";

const ApprovalRequestStartPage = () => {
  usePageTitle("Start a new approval request");
  const navigate = useNavigate();
  const tenantId = stores.tenantStore.currentTenantId;
  const composePath = tenantId
    ? Routes.tenantPath(tenantId, "/outbox/new/compose")
    : "/";
  const tenantScopeIsReady = stores.tenantStore.hasLoaded;
  const canUseTemplates =
    stores.tenantStore.currentTenant?.type === TenantType.Business &&
    stores.productStore.approvalStepTemplatesAreEnabled &&
    tenantId !== null;
  const hasTemplates = stores.approvalStepTemplateStore.templates.length > 0;
  const [requestType, setRequestType] = useState<RequestType>("custom");
  const [templateId, setTemplateId] = useState<number | "">("");

  useEffect(() => {
    if (!tenantScopeIsReady) {
      return;
    }

    if (!canUseTemplates) {
      navigate(composePath, { replace: true });
      return;
    }

    void stores.approvalStepTemplateStore.load(tenantId);
  }, [canUseTemplates, composePath, navigate, tenantId, tenantScopeIsReady]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(composePath, {
      state: requestType === "template" ? { templateId } : undefined,
    });
  };

  if (!tenantScopeIsReady) {
    return <LoadingOverlay />;
  }

  if (!canUseTemplates) {
    return null;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Start a new approval request
      </Typography>
      <Stack component="form" onSubmit={handleSubmit} spacing={Dialogs.formStackSpacing}>
        <FormControl>
          <RadioGroup
            value={requestType}
            onChange={(event) => setRequestType(event.target.value as RequestType)}
          >
            <FormControlLabel
              control={<Radio />}
              label="Custom"
              value="custom"
            />
            <FormControlLabel
              control={<Radio />}
              label="From template"
              value="template"
            />
          </RadioGroup>
        </FormControl>
        {requestType === "template" && (
          <TextField
            select
            fullWidth
            label="Template"
            value={templateId}
            onChange={(event) => {
              const value = event.target.value;
              setTemplateId(value === "" ? "" : Number(value));
            }}
          >
            {!hasTemplates && (
              <MenuItem disabled>No templates available</MenuItem>
            )}
            {stores.approvalStepTemplateStore.templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <Button
          disabled={
            requestType === "template" && (!hasTemplates || templateId === "")
          }
          sx={continueButtonSx}
          type="submit"
          variant="outlined"
        >
          Continue
        </Button>
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestStartPage);
