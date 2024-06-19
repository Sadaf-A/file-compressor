import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <NavLink exact to="/" activeClassName="active-link">Home</NavLink>
      <NavLink to="/login" activeClassName="active-link">Login</NavLink>
      <NavLink to="/register" activeClassName="active-link">Register</NavLink>
    </nav>
  );
};

export default Navbar;
