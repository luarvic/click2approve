import { confirmUserEmail } from "@/features/identity/api/authApi";
import { Pages } from "@/shared/constants/constants";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
      confirmUserEmail(userId, code)
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
  }, [navigate, searchParams]);

  return (
    <>
      <Box>{message}</Box>
      <Backdrop sx={Pages.backdropLoadingSx} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
