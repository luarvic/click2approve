import { createContext, useContext } from "react";

export type ApprovalRequestDetailsCardMode = "display" | "edit";

export const ApprovalRequestDetailsCardModeContext = createContext<ApprovalRequestDetailsCardMode>("display");

export const useApprovalRequestDetailsCardMode = (): ApprovalRequestDetailsCardMode =>
  useContext(ApprovalRequestDetailsCardModeContext);
