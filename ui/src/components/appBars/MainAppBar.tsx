import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PATH } from "../../data/constants";
import { stores } from "../../stores/stores";

const MainAppBar = () => {
  const navigate = useNavigate();
  const roleLabels = ["User", "Manager", "Admin"];

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar disableGutters sx={{ minHeight: 64, pl: 2, pr: 2 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Link
            component="button"
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
              width: "fit-content",
            }}
            onClick={() => {
              navigate(
                stores.userAccountStore.currentUser ? DEFAULT_PATH : "/"
              );
            }}
          >
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="click2approve®"
              sx={{
                display: "block",
                width: 36,
                height: 36,
                mr: 0.5,
              }}
            >
              <rect
                x="3.5"
                y="3.5"
                width="12"
                height="12"
                rx="3"
                fill="#FFFFFF"
                stroke="#22C55E"
                strokeWidth="2"
              />
              <path
                d="M8 8L18.5 13.5L14 14.5L16.75 19.5L14.25 20.75L11.5 15.75L8.5 19.25V8.75C8.5 8.25 8.3 8.05 8 8Z"
                fill="#111827"
                stroke="#FFFFFF"
                strokeLinejoin="round"
                strokeWidth="0.8"
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: "inherit",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              click2approve®
            </Typography>
          </Link>
        </Box>
        {stores.productStore.tenantsAreEnabled &&
          stores.userAccountStore.currentUser &&
          stores.tenantStore.tenants.length > 0 && (
            <Select
              size="small"
              value={stores.tenantStore.currentTenantId ?? ""}
              onChange={async (event) => {
                stores.tenantStore.setCurrentTenantId(Number(event.target.value));
                stores.userFileStore.clearUserFiles();
                stores.approvalRequestStore.clearApprovalRequests();
                stores.approvalRequestTaskStore.clearTasks();
                await stores.userFileStore.loadUserFiles();
                await stores.approvalRequestStore.loadApprovalRequests();
                await stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
                await stores.approvalRequestTaskStore.loadTasks(
                  stores.commonStore.currentTab
                );
              }}
              sx={{
                flexShrink: 1,
                maxWidth: { xs: 170, sm: 220 },
                minWidth: { xs: 120, sm: 180 },
                mr: 1,
              }}
            >
              {stores.tenantStore.tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.businessName} · {roleLabels[tenant.role]}
                </MenuItem>
              ))}
            </Select>
          )}
        {!stores.userAccountStore.currentUser ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/signIn")}
          >
            Sign in
          </Button>
        ) : (
          <IconButton
            color="inherit"
            onClick={() => stores.commonStore.setUserSettingsDrawerIsOpen(true)}
          >
            <Menu />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default observer(MainAppBar);
