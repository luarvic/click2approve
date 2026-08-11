import {
  countUnreadNotifications,
  DomainEventType,
  listNotifications,
  markNotificationRead,
  Notification,
} from "@/features/notifications/api/notificationsApi";
import { stores } from "@/app/rootStore";
import { Notifications, Refresh, Routes } from "@/shared/constants/constants";
import { NotificationsNoneOutlined } from "@mui/icons-material";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getNotificationText = (item: Notification) => {
  switch (item.type) {
    case DomainEventType.ApprovalRequestTaskCreated:
      return "A new approval task is ready.";
    case DomainEventType.ApprovalRequestCancelled:
      return "An approval request was cancelled.";
    case DomainEventType.ApprovalRequestReviewed:
      return "An approval request was reviewed.";
    case DomainEventType.DiscussionRequestMessageCreated:
    case DomainEventType.DiscussionTaskMessageCreated:
      return "You have a new chat message.";
    default:
      return "You have a new notification.";
  }
};

const getPath = (item: Notification) =>
  item.type === DomainEventType.ApprovalRequestCancelled ||
  item.type === DomainEventType.ApprovalRequestReviewed ||
  item.type === DomainEventType.DiscussionRequestMessageCreated
    ? `/outbox/${item.entityGlobalId}${item.type === DomainEventType.DiscussionRequestMessageCreated ? "/chat" : ""}`
    : `/inbox/${item.entityGlobalId}${item.type === DomainEventType.DiscussionTaskMessageCreated ? "/chat" : ""}`;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const workEmployeeGlobalId = stores.tenantStore.currentWorkEmployeeGlobalId;
  const loadCount = useCallback(async () => {
    if (tenantId) setCount(await countUnreadNotifications(tenantId));
  }, [tenantId]);

  useEffect(() => {
    void loadCount();
    if (Refresh.notificationsMs <= 0) return;
    const id = window.setInterval(
      () => void loadCount(),
      Refresh.notificationsMs,
    );
    return () => window.clearInterval(id);
  }, [loadCount, workEmployeeGlobalId]);
  const open = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    if (tenantId)
      setItems(
        await listNotifications(tenantId, true, Notifications.bellLimit),
      );
  };
  const select = async (item: Notification) => {
    if (!tenantId) return;
    await markNotificationRead(tenantId, item.globalId);
    setCount((current) => Math.max(0, current - 1));
    setAnchor(null);
    navigate(Routes.tenantPath(tenantId, getPath(item)));
  };
  return (
    <>
      <IconButton
        aria-label="Open notifications"
        color="inherit"
        onClick={(event) => void open(event)}
      >
        <Badge badgeContent={count} color="error">
          <NotificationsNoneOutlined />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchor}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={Boolean(anchor)}
        slotProps={{ paper: { sx: { maxWidth: 480 } } }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        onClose={() => setAnchor(null)}
      >
        <List
          dense
          subheader={
            <ListSubheader component="div">
              Recent unread notifications
            </ListSubheader>
          }
          sx={{ minWidth: 300 }}
        >
          {items.length === 0 && (
            <ListItem>
              <ListItemText primary="No unread notifications." />
            </ListItem>
          )}
          {items.map((item) => (
            <ListItemButton
              key={item.globalId}
              onClick={() => void select(item)}
            >
              <ListItemText primary={getNotificationText(item)} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;
