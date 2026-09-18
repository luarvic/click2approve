import { AuthForms } from "@/features/identity/components/authFormStyles";
import { TextField, TextFieldProps } from "@mui/material";

/** Shared input presentation for identity forms, including MFA codes. */
const AuthTextField = (props: Omit<TextFieldProps, "variant" | "margin" | "fullWidth">) => (
  <TextField {...props} fullWidth margin="normal" variant={AuthForms.inputVariant} />
);

export default AuthTextField;
