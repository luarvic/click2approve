import { Box, Container } from "@mui/material";
import { observer } from "mobx-react-lite";

// Not found page.
const NotFound = () => {
  return (
    <Container>
      <Box sx={{ pt: 3 }}>
        Sorry, but the page you are looking for has not been found.
      </Box>
    </Container>
  );
};

export default observer(NotFound);
