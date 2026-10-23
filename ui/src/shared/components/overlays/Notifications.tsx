import NotificationDetailsDialog from "@/shared/components/dialogs/NotificationDetailsDialog";
import { NotificationSettings } from "@/shared/components/overlays/notificationSettings";
import { Notifications } from "@/shared/config/application";
import { dismissNotification, subscribeToNotifications, type Notification } from "@/shared/utils/notifications";
import CloseIcon from "@mui/icons-material/Close";
import type { SlideProps, SxProps } from "@mui/material";
import { Alert, Button, IconButton, Slide, Snackbar } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useEffect, useState } from "react";

const notificationAlertSx: SxProps<Theme> = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr) auto",
  alignItems: "center",
  columnGap: 1.5,
  pl: 2,
  pr: 1,
  py: 1,
  "& .MuiAlert-icon": { gridColumn: 1, gridRow: 1, alignSelf: { xs: "start", sm: "center" }, m: 0, p: 0, py: 0.5 },
  "& .MuiAlert-message": { gridColumn: 2, gridRow: 1, minWidth: 0, overflowWrap: "anywhere", py: 0.5 },
  "& .MuiAlert-action": {
    display: { xs: "contents", sm: "flex" },
    alignItems: "center",
    gap: 1,
    gridColumn: 3,
    gridRow: 1,
    justifySelf: "end",
    m: 0,
    p: 0,
    "& .MuiButton-root": { gridColumn: 2, gridRow: 2, justifySelf: "end" },
    "& .MuiIconButton-root": { gridColumn: 3, gridRow: 1, alignSelf: { xs: "start", sm: "center" } },
  },
};
const snackbarSx: SxProps<Theme> = {
  left: "auto",
  maxWidth: { xs: "calc(100vw - 16px)", sm: "calc(100vw - 48px)" },
  right: { xs: "8px", sm: "24px" },
};
const closeButtonAriaLabel = "Close";
const SlideTransition = (props: SlideProps) => <Slide {...props} direction="up" />;

const NotificationHost = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [detailsNotification, setDetailsNotification] = useState<Notification | null>(null);

  useEffect(() => subscribeToNotifications(setNotifications), []);

  const currentNotification = notifications[0];

  return (
    <>
      {currentNotification !== undefined && (
        <Snackbar
          anchorOrigin={NotificationSettings.successAnchorOrigin}
          autoHideDuration={
            currentNotification.severity === "success"
              ? Notifications.successAutoHideDuration
              : Notifications.errorAutoHideDuration
          }
          key={currentNotification.id}
          onClose={(_, reason) => {
            if (reason !== "clickaway") {
              dismissNotification(currentNotification.id);
            }
          }}
          open
          sx={snackbarSx}
          slots={{
            transition: SlideTransition,
          }}
        >
          <Alert
            action={
              currentNotification.details.length > 0 ? (
                <>
                  <Button
                    color="inherit"
                    onClick={() => {
                      setDetailsNotification(currentNotification);
                      dismissNotification(currentNotification.id);
                    }}
                    size="small"
                  >
                    Details
                  </Button>
                  <IconButton
                    aria-label={closeButtonAriaLabel}
                    color="inherit"
                    onClick={() => dismissNotification(currentNotification.id)}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : undefined
            }
            onClose={() => dismissNotification(currentNotification.id)}
            severity={currentNotification.severity}
            sx={notificationAlertSx}
            variant="filled"
          >
            {currentNotification.message}
          </Alert>
        </Snackbar>
      )}
      {detailsNotification !== null && (
        <NotificationDetailsDialog
          details={detailsNotification.details}
          onClose={() => setDetailsNotification(null)}
          open
        />
      )}
    </>
  );
};

export default NotificationHost;
