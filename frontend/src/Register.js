import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import your CSS file

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/register', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      alert('Registration successful!'); // Optional: Provide user feedback
    } catch (error) {
      console.error('Error registering:', error);
      alert('Registration failed. Please try again.'); // Optional: Error handling
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h1>Register</h1>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
