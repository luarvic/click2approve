const refreshSecondsDefault = 30;
const filterTextInputDebounceMsDefault = 500;

const gridRefreshSeconds = Number(import.meta.env.VITE_GRID_REFRESH_SECONDS ?? String(refreshSecondsDefault));
const filterTextInputDebounceMs = Number(
  import.meta.env.VITE_FILTER_TEXT_INPUT_DEBOUNCE_MS ?? String(filterTextInputDebounceMsDefault),
);
const uncompletedTasksRefreshSeconds = Number(
  import.meta.env.VITE_UNCOMPLETED_TASKS_REFRESH_SECONDS ?? String(refreshSecondsDefault),
);
const discussionsRefreshSeconds = Number(
  import.meta.env.VITE_DISCUSSIONS_REFRESH_SECONDS ?? String(refreshSecondsDefault),
);
const notificationsRefreshSeconds = Number(
  import.meta.env.VITE_NOTIFICATIONS_REFRESH_SECONDS ?? String(refreshSecondsDefault),
);
const discussionNotificationLimit = Number(import.meta.env.VITE_DISCUSSION_NOTIFICATION_LIMIT ?? "10");
const notificationBellLimit = Number(import.meta.env.VITE_NOTIFICATION_BELL_LIMIT ?? "10");
const showPersistenceSuccessNotifications = import.meta.env.VITE_SHOW_PERSISTENCE_SUCCESS_NOTIFICATIONS !== "false";

const toRefreshSeconds = (value: number): number =>
  Number.isFinite(value) && value >= 0 ? value : refreshSecondsDefault;
const toDelayMs = (value: number): number =>
  Number.isFinite(value) && value >= 0 ? Math.floor(value) : filterTextInputDebounceMsDefault;

export const Api = {
  baseUri: import.meta.env.VITE_API_BASE_URI,
  uiBaseUri: import.meta.env.VITE_UI_BASE_URI,
  timeoutMs: 10000,
} as const;

export const Refresh = {
  gridSeconds: toRefreshSeconds(gridRefreshSeconds),
  uncompletedTasksSeconds: toRefreshSeconds(uncompletedTasksRefreshSeconds),
  discussionsSeconds: toRefreshSeconds(discussionsRefreshSeconds),
  notificationsSeconds: toRefreshSeconds(notificationsRefreshSeconds),
  get gridMs() {
    return this.gridSeconds * 1000;
  },
  get uncompletedTasksMs() {
    return this.uncompletedTasksSeconds * 1000;
  },
  get discussionsMs() {
    return this.discussionsSeconds * 1000;
  },
  get notificationsMs() {
    return this.notificationsSeconds * 1000;
  },
} as const;

export const Discussions = {
  notificationLimit:
    Number.isFinite(discussionNotificationLimit) && discussionNotificationLimit > 0
      ? Math.floor(discussionNotificationLimit)
      : 10,
} as const;

export const Filters = {
  textInputDebounceMs: toDelayMs(filterTextInputDebounceMs),
} as const;

export const Notifications = {
  bellLimit:
    Number.isFinite(notificationBellLimit) && notificationBellLimit > 0 ? Math.floor(notificationBellLimit) : 10,
  errorAutoHideDuration: 6000,
  errorMessageMaxLength: 160,
  showPersistenceSuccess: showPersistenceSuccessNotifications,
  successAutoHideDuration: 3000,
} as const;
