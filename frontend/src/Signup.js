

import React, { useState } from 'react';
import './Login.css';

export default function Signup({ onSignup, onShowLogin }) {
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        setForm({ username: '', password: '', email: '' });
        if (onSignup) onSignup();
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="auth-centered">
      <form onSubmit={handleSubmit} className="auth-form-panel">
        <h2>Create Account</h2>
        <label>Username
          <input name="username" value={form.username} onChange={handleChange} required placeholder="Enter your username" />
        </label>
        <label>Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Create a password" />
        </label>
        <label>Email Address
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Enter your email" />
        </label>
        <button type="submit" className="auth-btn">Sign Up</button>
        {error && <p className="auth-error">{error}</p>}
        {success && <p className="auth-success">{success}</p>}
        <div className="auth-login-link">
          Already have an account? <a href="#" className="login-link" onClick={e => { e.preventDefault(); if (onShowLogin) onShowLogin(); }}>Log In</a>
        </div>
      </form>
    </div>
  );
}
