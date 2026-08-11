import { stores } from "@/app/rootStore";
import { Refresh, Routes } from "@/shared/constants/constants";
import { NotificationsNoneOutlined } from "@mui/icons-material";
import { Badge, IconButton } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    const id = window.setInterval(
      () => void loadUnreadCount(),
      Refresh.notificationsMs,
    );
    return () => window.clearInterval(id);
  }, [loadUnreadCount, workEmployeeGlobalId]);
  return (
    <IconButton
      aria-label="Open notifications"
      color="inherit"
      disabled={!tenantId}
      onClick={() => navigate(Routes.tenantPath(tenantId!, "/notifications"))}
    >
      <Badge badgeContent={stores.notificationStore.unreadCount} color="error">
        <NotificationsNoneOutlined />
      </Badge>
    </IconButton>
  );
};

export default observer(NotificationBell);
