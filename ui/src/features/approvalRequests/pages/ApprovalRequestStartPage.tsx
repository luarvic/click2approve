import { stores } from "@/app/rootStore";
import { TenantType } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { Flex } from "@/shared/components/layout/flexStyles";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Stack, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type RequestType = "custom" | "template";

const ApprovalRequestStartPage = () => {
  usePageTitle("Start a new request");
  const navigate = useNavigate();
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const composePath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests/new/compose") : "/";
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const tenantScopeIsReady = stores.tenantStore.hasLoaded;
  const canUseTemplates =
    stores.tenantStore.currentTenant?.type === TenantType.Business &&
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    tenantGlobalId !== null;
  const hasTemplates = stores.approvalStepTemplateStore.templates.length > 0;
  const [requestType, setRequestType] = useState<RequestType>("custom");
  const [templateGlobalId, setTemplateGlobalId] = useState<string | "">("");

  const validation = useFormValidation(
    { templateGlobalId },
    {
      templateGlobalId: (value) =>
        requestType === "template" &&
        !stores.approvalStepTemplateStore.templates.some((template) => template.globalId === value)
          ? "Choose a template."
          : undefined,
    },
  );

  useEffect(() => {
    stores.approvalRequestStore.setRequestToClone(null);
  }, []);

  useEffect(() => {
    if (!tenantScopeIsReady) {
      return;
    }

    if (!canUseTemplates) {
      navigate(composePath, { replace: true });
      return;
    }

    const loader = ActionLoaders.pages.approvalRequestStart();
    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void stores.approvalStepTemplateStore
      .load(tenantGlobalId)
      .finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
  }, [canUseTemplates, composePath, navigate, tenantGlobalId, tenantScopeIsReady]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.validate()) return;
    navigate(composePath, {
      state: requestType === "template" ? { templateGlobalId } : undefined,
    });
  };

  if (!tenantScopeIsReady) {
    return null;
  }

  if (!canUseTemplates) {
    return null;
  }

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Requests", to: requestsPath }, { label: "New request" }]} />
      <NarrowContent>
        <Stack component="form" onSubmit={handleSubmit} spacing={Forms.formStackSpacing}>
          <FormControl>
            <RadioGroup value={requestType} onChange={(event) => setRequestType(event.target.value as RequestType)}>
              <FormControlLabel control={<Radio />} label="Custom" value="custom" />
              <FormControlLabel control={<Radio />} label="From template" value="template" />
            </RadioGroup>
          </FormControl>
          {requestType === "template" && (
            <TextField
              select
              fullWidth
              label="Template"
              value={templateGlobalId}
              {...validation.field("templateGlobalId")}
              onChange={(event) => setTemplateGlobalId(event.target.value)}
            >
              {!hasTemplates && <MenuItem disabled>No templates available</MenuItem>}
              {stores.approvalStepTemplateStore.templates.map((template) => (
                <MenuItem key={template.globalId} value={template.globalId}>
                  {template.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <MainActionButton sx={Flex.alignSelfStartSx} type="submit">
            Continue
          </MainActionButton>
        </Stack>
      </NarrowContent>
    </>
  );
};

export default observer(ApprovalRequestStartPage);
