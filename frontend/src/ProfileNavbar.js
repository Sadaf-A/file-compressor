import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink exact to="/" activeClassName="active-link">Home</NavLink>
      <NavLink to="/uploads" activeClassName="active-link">Uploads</NavLink>
      <NavLink to="/logout" activeClassName="active-link">Logout</NavLink>
    </nav>
  );
};

export default Navbar;