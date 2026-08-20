import LoadingButton, { type LoadingButtonProps } from "@mui/lab/LoadingButton";

type MainActionButtonProps = Omit<LoadingButtonProps, "variant">;

const MainActionButton = (props: MainActionButtonProps) => <LoadingButton variant="contained" {...props} />;

export default MainActionButton;
