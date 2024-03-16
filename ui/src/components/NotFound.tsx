import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";

// Not found page.
const NotFound = () => {
  return (
    <Box sx={{ p: 2 }}>
      Sorry, but the page you are looking for has not been found.
    </Box>
  );
};

export default observer(NotFound);
