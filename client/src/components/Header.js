import React from 'react';
import { Navbar, Nav, Button, Dropdown, Container } from 'react-bootstrap';
import { LogIn, PlusCircle } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode, setFilter, isLoggedIn, onLogin, onNewTopic }) => (
  <Navbar bg="primary" variant="dark" expand="lg">
    <Container>
      <Navbar.Brand href="#home">WaHiDa</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav>
          <Button variant="outline-light" onClick={toggleDarkMode} className="me-2">
            {darkMode ? '☀️' : '🌙'}
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
              Show
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilter('all')}>Show All</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter('unwatched')}>Show Unwatched</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter('watched')}>Show Watched</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {isLoggedIn ? (
            <Button variant="outline-light" className="ms-2" onClick={onNewTopic}>
              <PlusCircle size={18} /> New Topic
            </Button>
          ) : (
            <Button variant="outline-light" className="ms-2" onClick={onLogin}>
              <LogIn size={18} /> Login with Google
            </Button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default Header;