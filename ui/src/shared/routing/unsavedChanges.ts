let confirmLeaving: (() => boolean) | undefined;

/** Registers the active form's discard check for actions that change session context. */
export const registerUnsavedChangesCheck = (check: () => boolean) => {
  confirmLeaving = check;
  return () => {
    if (confirmLeaving === check) confirmLeaving = undefined;
  };
};

/** Check before switching organization/employee or signing out, before mutating stores. */
export const confirmUnsavedChanges = () => confirmLeaving?.() ?? true;
