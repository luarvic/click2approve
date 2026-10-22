import { LinearProgress } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

const loadingOverlaySx: SxProps<Theme> = {
  left: 0,
  position: "fixed",
  right: 0,
  top: 0,
};

const LoadingOverlay = () => {
  return <LinearProgress sx={loadingOverlaySx} />;
};

export default LoadingOverlay;
