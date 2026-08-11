import { stores } from "@/app/rootStore";
import ApprovalRequestNumberText from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestRevisionChip from "@/features/approvalRequests/components/ApprovalRequestRevisionChip";
import {
  countUnreadDiscussions,
  DiscussionUnreadItem,
  listUnreadDiscussions,
} from "@/features/discussions/api/discussionsApi";
import { Discussions, Refresh, Routes } from "@/shared/constants/constants";
import { MailOutline, NotificationsNoneOutlined } from "@mui/icons-material";
import {
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popover,
  SxProps,
  Theme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const popoverPaperSx: SxProps<Theme> = { maxWidth: 480 };
const unreadDiscussionsListSx: SxProps<Theme> = { minWidth: 300 };
const unreadDiscussionIconSx: SxProps<Theme> = { minWidth: 32 };

const DiscussionBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<DiscussionUnreadItem[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const tenantId = stores.tenantStore.currentTenantGlobalId;
  const workEmployeeGlobalId = stores.tenantStore.currentWorkEmployeeGlobalId;
  const loadCount = useCallback(async () => {
    if (tenantId) {
      setCount(await countUnreadDiscussions(tenantId));
    }
  }, [tenantId]);

  useEffect(() => {
    void loadCount();
    if (Refresh.discussionsMs <= 0) {
      return;
    }

    const id = window.setInterval(() => void loadCount(), Refresh.discussionsMs);
    return () => window.clearInterval(id);
  }, [loadCount, workEmployeeGlobalId]);

  useEffect(() => {
    const refresh = () => void loadCount();
    window.addEventListener("click2approve:discussion-unread-items-changed", refresh);
    return () => window.removeEventListener("click2approve:discussion-unread-items-changed", refresh);
  }, [loadCount, workEmployeeGlobalId]);

  const open = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    if (tenantId) {
      setItems(await listUnreadDiscussions(tenantId, Discussions.notificationLimit));
    }
  };

  const select = (item: DiscussionUnreadItem) => {
    if (!tenantId) {
      return;
    }

    setCount((current) => Math.max(0, current - 1));
    setAnchor(null);
    navigate(
      Routes.tenantPath(
        tenantId,
        item.approvalRequestTaskGlobalId
          ? `/inbox/${item.approvalRequestTaskGlobalId}/chat`
          : `/outbox/${item.approvalRequestGlobalId}/chat`,
      ),
    );
  };

  return (
    <>
      <IconButton aria-label="Open chats" color="inherit" onClick={(event) => void open(event)}>
        <Badge badgeContent={count} color="error">
          <NotificationsNoneOutlined />
        </Badge>
      </IconButton>
      <Popover
        anchorEl={anchor}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={Boolean(anchor)}
        slotProps={{ paper: { sx: popoverPaperSx } }}
        transformOrigin={{ horizontal: "center", vertical: "top" }}
        onClose={() => setAnchor(null)}
      >
        <List
          dense
          subheader={(
            <ListSubheader component="div">
              Last {Discussions.notificationLimit} unread chats
            </ListSubheader>
          )}
          sx={unreadDiscussionsListSx}
        >
          {items.length === 0 && (
            <ListItem>
              <ListItemText primary="No unread chats." />
            </ListItem>
          )}
          {items.map((item) => (
            <ListItemButton key={item.globalId} onClick={() => void select(item)}>
              <ListItemIcon sx={unreadDiscussionIconSx}>
                <MailOutline />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <>
                    <ApprovalRequestNumberText globalId={item.approvalRequestGlobalId} />
                    {" "}
                    {item.approvalRequestTitle}{" "}
                    <ApprovalRequestRevisionChip revisionNumber={item.revisionNumber} />
                  </>
                )}
              />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};
export default DiscussionBell;
