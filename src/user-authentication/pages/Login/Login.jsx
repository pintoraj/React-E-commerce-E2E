import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import Notification from '../../components/Notification/Notification';

const API = 'http://localhost:3001';

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
      if (user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

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
      const idVal = identifier.trim().toLowerCase();
      const pwd = password;
      const queryUrl = isEmail(idVal)
        ? `${API}/users?email=${encodeURIComponent(idVal)}&password=${encodeURIComponent(pwd)}`
        : `${API}/users?username=${encodeURIComponent(idVal)}&password=${encodeURIComponent(pwd)}`;

      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error('Login request failed');
      const data = await res.json();

      if (data.length === 0) {
        setNotif({ message: 'Invalid credentials', type: 'error', visible: true });
        setTimeout(() => setNotif(v => ({ ...v, visible: false })), 1200);
        setLoading(false);
        return;
      }

      const u = data[0];
      login(u);
      setNotif({ message: `Welcome back, ${u.username}`, type: 'success', visible: true });

      setTimeout(() => {
        setNotif(v => ({ ...v, visible: false }));
        if (u.isAdmin) {
          navigate('/admin', { replace: true });
          setRedirectPath(null);
        } else if (redirectPath) {
          navigate(redirectPath, { replace: true });
          setRedirectPath(null);
        } else {
          navigate('/', { replace: true });
        }
      }, 700);
    } catch {
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
