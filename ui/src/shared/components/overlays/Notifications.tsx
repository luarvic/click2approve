import NotificationDetailsDialog from "@/shared/components/dialogs/NotificationDetailsDialog";
import { Notifications } from "@/shared/constants/constants";
import {
  dismissNotification,
  type Notification,
  subscribeToNotifications,
} from "@/shared/utils/notifications";
import CloseIcon from "@mui/icons-material/Close";
import type { SlideProps, SxProps } from "@mui/material";
import { Alert, Button, IconButton, Slide, Snackbar } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useEffect, useState } from "react";

const notificationAlertSx: SxProps<Theme> = { width: "100%" };
const snackbarSx: SxProps<Theme> = { opacity: 0.9 };
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
          anchorOrigin={Notifications.successAnchorOrigin}
          autoHideDuration={currentNotification.severity === "success"
            ? Notifications.successAutoHideDuration
            : Notifications.errorAutoHideDuration}
          key={currentNotification.id}
          onClose={(_, reason) => {
            if (reason !== "clickaway") {
              dismissNotification(currentNotification.id);
            }
          }}
          open
          sx={snackbarSx}
          TransitionComponent={SlideTransition}
        >
          <Alert
            action={currentNotification.details.length > 0 ? (
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
            ) : undefined}
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
