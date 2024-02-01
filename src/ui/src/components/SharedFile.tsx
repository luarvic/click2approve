import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Message } from "semantic-ui-react";
import { API_URI } from "../stores/Constants";
import { testSharedArchive } from "../utils/ApiClient";

export const SharedFile = () => {
  const { key } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (key) {
      testSharedArchive(key).catch(() => navigate("/notfound"));
    } else {
      navigate("/notfound");
    }
  }, []);

  return (
    <Container>
      <Message>
        Click <a href={`${API_URI}/downloadShared?key=${key}`}>here</a> to
        download the file.
      </Message>
    </Container>
  );
};

export default SharedFile;
