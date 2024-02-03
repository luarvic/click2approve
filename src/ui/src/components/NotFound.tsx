import { observer } from "mobx-react-lite";
import { Container, Message } from "semantic-ui-react";

// Not found page.
export const NotFound = () => {
  return (
    <Container>
      <Message>Sorry, but the page you are looking for has not been found.</Message>
    </Container>
  );
};

export default observer(NotFound);
