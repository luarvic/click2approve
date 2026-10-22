import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Box } from "@mui/material";
import { ComponentPropsWithoutRef } from "react";

/** Shared form layout for identity pages and sign-in verification. */
const AuthForm = (props: ComponentPropsWithoutRef<"form">) => (
  <Box component="form" sx={AuthForms.authFormSx} {...props} />
);

export default AuthForm;
