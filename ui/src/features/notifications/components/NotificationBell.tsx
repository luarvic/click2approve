import { stores } from "@/app/rootStore";
import { Refresh } from "@/shared/config/application";
import { Routes } from "@/shared/routing/routes";
import { NotificationsNoneOutlined } from "@mui/icons-material";
import { Badge, IconButton, type SxProps, type Theme } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const notificationBellSx: SxProps<Theme> = {
  borderRadius: "50%",
  height: 40,
  width: 40,
  "& .MuiSvgIcon-root": { fontSize: 24 },
  "@media (pointer: coarse)": { height: 44, width: 44 },
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const workEmployeeGlobalId = stores.tenantStore.currentWorkEmployeeGlobalId;
  const loadUnreadCount = useCallback(async () => {
    if (tenantId) {
      await stores.notificationStore.loadUnreadCount(tenantId);
    }
  }, [tenantId]);

  useEffect(() => {
    void loadUnreadCount();
    if (Refresh.notificationsMs <= 0) return;
    const id = window.setInterval(() => void loadUnreadCount(), Refresh.notificationsMs);
    return () => window.clearInterval(id);
  }, [loadUnreadCount, workEmployeeGlobalId]);
  return (
    <IconButton
      data-user-guide="notifications"
      aria-label="Open notifications"
      color="inherit"
      disabled={!tenantId}
      size="medium"
      sx={notificationBellSx}
      onClick={() => navigate(Routes.tenantPath(tenantId!, "/notifications"))}
    >
      <Badge badgeContent={stores.notificationStore.unreadCount} color="error">
        <NotificationsNoneOutlined />
      </Badge>
    </IconButton>
  );
};

export default observer(NotificationBell);
