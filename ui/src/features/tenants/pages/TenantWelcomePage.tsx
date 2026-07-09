import { Pages } from "@/shared/constants/constants";
import { writeCurrentTenantId } from "@/shared/session/session";
import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const TenantWelcomePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantName = searchParams.get("tenant") ?? "your tenant";
  const tenantId = searchParams.get("tenantId");

  useEffect(() => {
    if (tenantId) {
      writeCurrentTenantId(Number(tenantId));
    }
  }, [tenantId]);

  return (
    <Box sx={Pages.tenantWelcomeContainerSx}>
      <Typography variant="h5" sx={Pages.titleSx}>
        Welcome to {tenantName}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/signIn")}>
        Sign in
      </Button>
    </Box>
  );
};

export default TenantWelcomePage;
