import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { writeCurrentTenantId } from "../../lib/session";

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
    <Box sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Welcome to {tenantName}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/signIn")}>
        Sign in
      </Button>
    </Box>
  );
};

export default TenantWelcomePage;
