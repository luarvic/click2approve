import React, { Fragment } from 'react';
import { Container } from 'semantic-ui-react';
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
import UserFiles from './UserFiles';

const App = () => {
  return (
    <Fragment>
      <Container>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UserFiles />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </Fragment>
  );
}

export default App;
