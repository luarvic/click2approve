import { Alert, AlertProps } from "@mui/material";

type Props = Pick<AlertProps, "action" | "children" | "severity">;

/** Shared inline notice for page and dialog information, warnings, and errors. */
const InlineNotice = ({ children, severity = "info", action }: Props) => (
  <Alert action={action} severity={severity} variant="standard">
    {children}
  </Alert>
);

export default InlineNotice;
