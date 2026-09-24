import { stores } from "@/app/rootStore";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import ImagePicker from "@/shared/components/images/ImagePicker";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { emailRule, textRule, urlRule } from "@/shared/utils/formValidation";
import { Business } from "@mui/icons-material";
import { Button, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export interface OrganizationDraft {
  details: UpdateTenantRequest;
  logo?: File;
}

interface TenantDialogProps {
  draft?: OrganizationDraft;
  onNext?: (draft: OrganizationDraft) => void;
  canEdit: boolean;
  canScheduleDeletion: boolean;
  tenant?: Tenant | null;
  onClose: (currentTenantGlobalId?: string) => void;
  onSubmit: (
    payload: CreateTenantRequest | UpdateTenantRequest,
    tenantGlobalId?: string,
    logo?: File,
  ) => Promise<Tenant | null>;
  onLogoUpload: (tenantGlobalId: string, logo: File) => Promise<boolean>;
  onLogoDelete: (tenantGlobalId: string) => Promise<boolean>;
  onScheduleDeletion: () => void;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  tenant,
  draft,
  onNext,
  canEdit,
  canScheduleDeletion,
  onClose,
  onSubmit,
  onLogoUpload,
  onLogoDelete,
  onScheduleDeletion,
}) => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoWasRemoved, setLogoWasRemoved] = useState(false);
  const saveLoader = ActionLoaders.tenants.save(tenant?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = !tenant;
  const saveIsLoading = saveAction.isRunning;

  const reset = useCallback(() => {
    setBusinessName(tenant?.businessName ?? draft?.details.businessName ?? "");
    setEmail(tenant?.email ?? draft?.details.email ?? "");
    setPhone(tenant?.phone ?? draft?.details.phone ?? "");
    setAddress(tenant?.address ?? draft?.details.address ?? "");
    setWebsiteUrl(tenant?.websiteUrl ?? draft?.details.websiteUrl ?? "");
    setLogoFile(draft?.logo ?? null);
    setLogoWasRemoved(false);
  }, [draft, tenant]);

  useEffect(() => {
    reset();
  }, [reset]);

  const validation = useFormValidation(
    { businessName, email, phone, address, websiteUrl },
    {
      businessName: textRule("Business name", FieldLimits.name, true),
      email: emailRule(),
      phone: textRule("Phone", FieldLimits.phone),
      address: textRule("Address", FieldLimits.details),
      websiteUrl: urlRule,
    },
  );

  const handleSubmit = async () => {
    if (!validation.validate()) return;
    if (isNew && onNext) {
      onNext({
        details: {
          businessName: businessName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
        },
        logo: logoFile ?? undefined,
      });
      return;
    }
    await validation.run(() =>
      saveAction.run(async () => {
        const savedTenant = await onSubmit(
          {
            businessName: businessName.trim(),
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
          },
          tenant?.globalId,
          isNew ? (logoFile ?? undefined) : undefined,
        );

        if (!savedTenant) {
          return;
        }

        if (logoWasRemoved) {
          const deleted = await onLogoDelete(savedTenant.globalId);
          if (!deleted) {
            return;
          }
        }

        if (logoFile && !isNew) {
          const uploaded = await onLogoUpload(savedTenant.globalId, logoFile);
          if (!uploaded) {
            return;
          }
        }

        onClose(savedTenant.globalId);
      }),
    );
  };

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoWasRemoved(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoWasRemoved(Boolean(tenant?.logo));
  };

  return (
    <CloseOnEscape onClose={() => onClose(tenant?.globalId)}>
      <PageBreadcrumbs
        items={[
          {
            label: "Organizations",
            state: tenant ? { currentTenantGlobalId: tenant.globalId } : undefined,
            to: "/tenants",
          },
          {
            label: tenant?.businessName ?? "New organization",
            titleAction: (
              <HelpPopover
                helpText={
                  isNew
                    ? "Enter your organization details, then choose a plan. Paid workspaces remain restricted until payment succeeds. Business Trial is available once per owner."
                    : "Update your organization details and logo. Only the owner can delete the organization."
                }
              />
            ),
          },
        ]}
      />
      <Stack spacing={Forms.formStackSpacing}>
        <ImagePicker
          alt="Organization logo"
          fallback={<Business fontSize="large" />}
          imageSize={stores.applicationConfigurationStore.applicationConfiguration?.logoImageSize ?? 256}
          imageUrl={logoWasRemoved ? undefined : tenant?.logo}
          selectedFile={logoFile}
          disabled={!isNew && !canEdit}
          onDelete={handleLogoRemove}
          onSave={handleLogoSelect}
          title="Edit logo"
        />
        <TextField
          label="Business name"
          required
          value={businessName}
          {...validation.field("businessName")}
          onChange={(event) => setBusinessName(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Email"
          value={email}
          {...validation.field("email")}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Phone"
          value={phone}
          {...validation.field("phone")}
          onChange={(event) => setPhone(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Address"
          value={address}
          {...validation.field("address")}
          onChange={(event) => setAddress(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Website URL"
          value={websiteUrl}
          {...validation.field("websiteUrl")}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          disabled={!isNew && !canEdit}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
        <Button variant="outlined" onClick={() => onClose(tenant?.globalId)}>
          Cancel
        </Button>
        {!isNew && canScheduleDeletion && (
          <Button color="error" disabled={saveIsLoading} variant="outlined" onClick={onScheduleDeletion}>
            Delete
          </Button>
        )}
        {(isNew || canEdit) && (
          <MainActionButton loading={saveIsLoading} onClick={handleSubmit}>
            {isNew ? "Next" : "Save"}
          </MainActionButton>
        )}
      </Stack>
    </CloseOnEscape>
  );
};

export default TenantDialog;
