import React, { useState } from 'react';

import './Login.css';


export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.email, password: form.password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        if (onLogin) onLogin();
      } else {
        setError('Invalid credentials.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="auth-centered">
      <form onSubmit={handleSubmit} className="auth-form-panel">
        <h2>Welcome Back</h2>
        <label>Email Address
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>
        <label>Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </label>
        <div className="auth-form-links">
          <button type="button" className="forgot-link" onClick={() => { /* TODO: route to forgot password */ }}>
            Forgot Password?
          </button>
        </div>
        <button type="submit" className="auth-btn">Log In</button>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-social">
          <button type="button" className="auth-social-btn google">Google</button>
          <button type="button" className="auth-social-btn apple">Apple</button>
        </div>
        <div className="auth-signup-link">
          New here? <button type="button" className="signup-link" onClick={() => { /* TODO: route to signup */ }}>Sign Up</button>
        </div>
      </form>
    </div>
  );
}


