import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
          navigate("/");
        }
      });
    } else {
      setMessage(
        "A confirmation link was sent to your email. Confirm your email address to continue."
      );
    }
  }, []);

  return <Box sx={{ p: 2 }}>{message}</Box>;
};

export default ConfirmEmailPage;
