import { Backdrop, Box, CircularProgress } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { stores } from "../../stores/Stores";
import { confirmEmail } from "../../utils/apiClient";

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");

    if (userId && code) {
      confirmEmail(userId, code).then((result) => {
        if (result) {
          setMessage("Email confirmation succeeded. Sing in to continue.");
        } else {
          setMessage("Email confirmation failed.");
        }
      });
    } else {
      navigate("/notfound");
    }
  }, []);

  return (
    <>
      <Box sx={{ p: 2 }}>{message}</Box>;
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={stores.commonStore.isLoading("common")}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
