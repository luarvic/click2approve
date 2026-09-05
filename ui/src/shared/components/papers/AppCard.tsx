import { Card, type CardProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

interface AppCardProps extends CardProps {
  elevated?: boolean;
}

const AppCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "elevated" && prop !== "sx" && prop !== "as" && prop !== "theme",
})<AppCardProps>(({ elevated, theme }) => ({
  ...(elevated ? { boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.08)}` } : {}),
}));

export default AppCard;
