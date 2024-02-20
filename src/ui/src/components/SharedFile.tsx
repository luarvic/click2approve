import { Box, Container } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URI } from "../stores/Constants";
import { testSharedArchive } from "../utils/ApiClient";

// Shared file download page.
export const SharedFile = () => {
  const { key } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (key) {
      testSharedArchive(key).catch(() => navigate("/notfound"));
    } else {
      navigate("/notfound");
    }
  }, []);

  return (
    <Container>
      <Box sx={{ pt: 3 }}>
        Click <a href={`${API_URI}/downloadShared?key=${key}`}>here</a> to
        download the file.
      </Box>
    </Container>
  );
};

export default SharedFile;
