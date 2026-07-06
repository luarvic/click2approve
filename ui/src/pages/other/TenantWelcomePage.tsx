import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PAGE_TITLE_SX,
  TENANT_WELCOME_CONTAINER_SX,
} from "../../data/constants";
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
    <Box sx={TENANT_WELCOME_CONTAINER_SX}>
      <Typography variant="h5" sx={PAGE_TITLE_SX}>
        Welcome to {tenantName}
      </Typography>
      <Button variant="contained" onClick={() => navigate("/signIn")}>
        Sign in
      </Button>
    </Box>
  );
};

export default TenantWelcomePage;
