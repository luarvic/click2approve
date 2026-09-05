import { registerUnsavedChangesCheck } from "@/shared/routing/unsavedChanges";
import { notification } from "@/shared/utils/notifications";
import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/** Warns before losing form edits. Form values are never written to browser storage. */
export const useUnsavedChanges = (hasChanges: boolean, isBusy = false) => {
  const state = useRef({ hasChanges, isBusy });
  state.current = { hasChanges, isBusy };
  const mayLeave = useRef(false);
  const markSaved = useCallback(() => {
    mayLeave.current = true;
  }, []);
  const confirmDiscard = useCallback(() => {
    if (mayLeave.current) return true;
    if (state.current.isBusy) {
      notification.warning("Wait for the current action to finish before leaving.");
      return false;
    }
    if (!state.current.hasChanges) return true;
    if (!window.confirm("Discard unsaved changes? Your changes will be lost.")) return false;
    return true;
  }, []);

  useBlocker(
    ({ currentLocation, nextLocation }) =>
      (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search) &&
      !confirmDiscard(),
  );

  useEffect(() => registerUnsavedChangesCheck(confirmDiscard), [confirmDiscard]);
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (mayLeave.current || (!state.current.hasChanges && !state.current.isBusy)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { confirmDiscard, markSaved };
};
