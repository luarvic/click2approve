import { stores } from "@/app/rootStore";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Box, Chip } from "@mui/material";
import { observer } from "mobx-react-lite";

const AppBrandBadge = () => (
  <Box component="span" sx={Shell.appBarBrandBadgeSx}>
    <span>Click2Approve</span>
    <Chip
      component="span"
      label={stores.applicationConfigurationStore.isOpenSourceEdition ? "Free" : "App"}
      size="small"
      sx={Shell.appBarBrandChipSx}
    />
  </Box>
);

export default observer(AppBrandBadge);
