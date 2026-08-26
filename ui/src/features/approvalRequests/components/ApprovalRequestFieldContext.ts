import type { TypographyProps } from "@mui/material";
import { createContext } from "react";

export const ApprovalRequestFieldValueVariantContext = createContext<TypographyProps["variant"]>("body1");
