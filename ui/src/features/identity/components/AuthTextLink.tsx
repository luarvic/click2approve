import { Link, type LinkProps } from "@mui/material";

type AuthTextLinkProps = Omit<LinkProps, "variant"> & { disabled?: boolean };

/** Shared regular-text secondary link for identity forms. */
const AuthTextLink = (props: AuthTextLinkProps) => <Link variant="body1" {...(props as LinkProps)} />;

export default AuthTextLink;
