import Button, { type ButtonProps } from "@mui/material/Button";

type MainActionButtonProps = Omit<ButtonProps, "variant">;

const MainActionButton = (props: MainActionButtonProps) => <Button variant="contained" {...props} />;

export default MainActionButton;
