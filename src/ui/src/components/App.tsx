import React, { Fragment } from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import NavBar from './NavBar';
import UserFiles from './UserFiles';

const App = () => {
  return (
    <Fragment>
      <Container>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<UserFiles />} />
          </Routes>
        </BrowserRouter>
      </Container>
    </Fragment>
  );
}

export default App;
