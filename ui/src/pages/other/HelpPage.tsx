import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";

const HelpPage = () => {
  return (
    <Box>
      <Typography component="h1" variant="h5">
        Welcome to the file approval service
      </Typography>
    </Box>
  );
};

export default observer(HelpPage);
