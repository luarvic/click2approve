import ReceiptsGrid from "@/features/receipts/components/ReceiptsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
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
          },
        ]}
      />
      <ReceiptsGrid currentReceiptGlobalId={currentReceiptGlobalId} />
    </>
  );
};

export default ReceiptsPage;
