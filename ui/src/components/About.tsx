import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";

// Shows either message or user files depending on whether it's anonymous or specific user.
const About = () => {
  return <Box sx={{ p: 2 }}>Please, sign in to manage your files.</Box>;
};

export default observer(About);
