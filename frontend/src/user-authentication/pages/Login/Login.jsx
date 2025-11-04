import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import Notification from '../../components/Notification/Notification';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [notif, setNotif] = useState({ message: '', type: 'info', visible: false });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, login, redirectPath, setRedirectPath } = useAuth();

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        if (user.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 0); // ✅ Avoid navigating during render
    }
  }, [user, navigate]);

  function validate() {
    const e = {};
    if (!identifier.trim()) e.identifier = 'Email or username is required';
    if (!password) e.password = 'Password is required';
    return e;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    const ev = validate();
    if (Object.keys(ev).length) {
      setErrors(ev);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        identifier: identifier.trim().toLowerCase(),
        password
      };

      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('Content-Type');
      if (!res.ok || !contentType?.includes('application/json')) {
        throw new Error('Invalid response format');
      }

      const { token, user } = await res.json();

      if (!token || !user?.id) {
        setNotif({ message: 'Invalid credentials', type: 'error', visible: true });
        setTimeout(() => setNotif(v => ({ ...v, visible: false })), 1200);
        setLoading(false);
        return;
      }

      // ✅ Store token and user in context
      login({ token, user });

      setNotif({ message: `Welcome back, ${user.username}`, type: 'success', visible: true });

      setTimeout(() => {
        setNotif(v => ({ ...v, visible: false }));
        if (user.isAdmin) {
          navigate('/admin', { replace: true });
        } else if (redirectPath) {
          navigate(redirectPath, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        setRedirectPath(null);
      }, 700);
    } catch (err) {
      console.error('❌ Login error:', err);
      setNotif({ message: 'Login failed. Try again.', type: 'error', visible: true });
      setTimeout(() => setNotif(v => ({ ...v, visible: false })), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="u-auth-page">
        <div className="u-auth-card">
          <h2 className="u-title">Log <span>In</span></h2>
          <p className="u-subtitle">Sign in with your email or username</p>

          <form className="u-auth-form" onSubmit={onSubmit} noValidate>
            <label>Email or Username*</label>
            <input
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Email or username"
              type="text"
              autoComplete="username"
              aria-label="Email or username"
            />
            {errors.identifier && <div className="u-field-err" aria-live="polite">{errors.identifier}</div>}

            <label>Password*</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              type="password"
              autoComplete="current-password"
              aria-label="Password"
            />
            {errors.password && <div className="u-field-err" aria-live="polite">{errors.password}</div>}

            <div className="u-forgot-wrap">
              <Link to="#" className="u-link-small">Forgot your password?</Link>
            </div>

            <div className="u-auth-actions">
              <button className="u-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <span className="u-alt-register">
                New to our store? <Link to="/register">Create your account</Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      <Notification message={notif.message} type={notif.type} visible={notif.visible} />
    </>
  );
}
