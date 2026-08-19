import ReceiptsGrid from "@/features/receipts/components/ReceiptsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useLocation } from "react-router-dom";

interface ReceiptsLocationState {
  currentReceiptGlobalId?: string;
}

const ReceiptsPage = () => {
  usePageTitle("Receipts");
  const location = useLocation();
  const { currentReceiptGlobalId } = (location.state as ReceiptsLocationState | null) ?? {};

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Receipts",
            titleAction: <HelpPopover helpText="View completed request snapshots." />,
          },
        ]}
      />
      <ReceiptsGrid currentReceiptGlobalId={currentReceiptGlobalId} />
    </>
  );
};

export default ReceiptsPage;
