import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Alert } from "@mui/material";

const SubscriptionBillingPage = () => {
  usePageTitle("Subscription billing");
  return (
    <NarrowContent>
      <PageBreadcrumbs
        items={[{ label: "Subscription" }, { label: "Billing" }]}
      />
      <Alert severity="info">
        Billing will open here when Stripe is connected.
      </Alert>
    </NarrowContent>
  );
};

export default SubscriptionBillingPage;
