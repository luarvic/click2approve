import { Backdrop, Box, CircularProgress } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmEmail } from "../../api/controllers/auth";

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");

    if (userId && code) {
      setIsLoading(true);
      confirmEmail(userId, code)
        .then((result) => {
          if (result) {
            setMessage("Email confirmation succeeded. Sign in to continue.");
          } else {
            setMessage("Email confirmation failed.");
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/notfound");
    }
  }, []);

  return (
    <>
      <Box>{message}</Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
