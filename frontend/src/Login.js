import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setJWTToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      setJWTToken(response.data.token);
      localStorage.setItem('username', username);
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true)
      console.log(response.data.token)
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  if (isLoggedIn) {
    return <Navigate to="/profile" />; 
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <div>
        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;

