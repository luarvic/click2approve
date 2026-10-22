import { CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";

const AppCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  "&:last-child": { paddingBottom: theme.spacing(2) },
}));

export default AppCardContent;
