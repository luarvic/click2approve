import { AuthForms } from "@/features/identity/components/authFormStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { Box, Stack } from "@mui/material";
import { PropsWithChildren } from "react";

/** Consistent spacing for identity form primary and secondary actions. */
const AuthFormActions = ({ children }: PropsWithChildren) => (
  <Box sx={AuthForms.authActionsSx}>
    <Stack spacing={StackSpacing.loose}>{children}</Stack>
  </Box>
);

export default AuthFormActions;
