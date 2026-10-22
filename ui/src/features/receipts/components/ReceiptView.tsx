import ReceiptCard from "@/features/receipts/components/ReceiptCard";
import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import type { Receipt } from "@/features/receipts/models/receipt";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ReceiptViewProps {
  afterTitleContent?: ReactNode;
  cardSx?: SxProps<Theme>;
  footerContent?: ReactNode;
  headerContent?: ReactNode;
  receipt: Receipt | PublicReceipt;
  titleContent?: ReactNode;
}

/** Renders a receipt consistently in authenticated and public receipt views. */
const ReceiptView: React.FC<ReceiptViewProps> = ({
  afterTitleContent,
  cardSx,
  footerContent,
  headerContent,
  receipt,
  titleContent,
}) => (
  <ReceiptCard
    afterTitleContent={afterTitleContent}
    sx={cardSx}
    footerContent={footerContent}
    headerContent={headerContent}
    receipt={receipt}
    titleContent={titleContent}
  />
);

export default ReceiptView;
