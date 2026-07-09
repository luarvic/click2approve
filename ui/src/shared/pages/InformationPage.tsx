import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

interface InformationPageProps {
  message?: string;
}

const InformationPage: React.FC<InformationPageProps> = ({ message }) => {
  const location = useLocation();

  return <Box>{message ?? location.state.message}</Box>;
};

export default InformationPage;
