import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import Notification from '../../components/Notification/Notification';

const API = import.meta.env.VITE_API_URL;

export default function Register() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [notif, setNotif] = useState({ message: '', type: 'info', visible: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setErrors({});
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);

    try {
      const emailCheck = await fetch(`${API}/users/check-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const emailExists = await emailCheck.json();
      if (emailExists) {
        setErrors({ email: 'Email already registered' });
        setLoading(false);
        return;
      }

      const usernameCheck = await fetch(`${API}/users/check-username?username=${encodeURIComponent(username.trim().toLowerCase())}`);
      const usernameExists = await usernameCheck.json();
      if (usernameExists) {
        setErrors({ username: 'Username already taken' });
        setLoading(false);
        return;
      }

      const payload = {
        username: username.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim()
      };

      const resp = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Failed to register');

      setNotif({ message: `Registered successfully as ${payload.username}`, type: 'success', visible: true });
      setTimeout(() => {
        setNotif(v => ({ ...v, visible: false }));
        navigate('/login');
      }, 900);
    } catch (err) {
      console.error(err);
      setNotif({ message: 'Registration failed. Try again.', type: 'error', visible: true });
      setTimeout(() => setNotif(v => ({ ...v, visible: false })), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="u-auth-page">
        <div className="u-register-card">
          <h2 className="u-title">Create Your Account</h2>
          <p className="u-subtitle">Join us and start shopping smarter</p>

          <form className="u-reg-form" onSubmit={onSubmit} noValidate>
            <div className="u-grid">
              <div>
                <label>Username*</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  aria-label="Username"
                  disabled={loading}
                />
                {errors.username && <div className="u-field-err">{errors.username}</div>}
              </div>

              <div>
                <label>First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  aria-label="First name"
                  disabled={loading}
                />
              </div>

              <div>
                <label>Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  aria-label="Last name"
                  disabled={loading}
                />
              </div>

              <div>
                <label>Email*</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  aria-label="Email"
                  disabled={loading}
                />
                {errors.email && <div className="u-field-err">{errors.email}</div>}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label>Password*</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  aria-label="Password"
                  disabled={loading}
                />
                {errors.password && <div className="u-field-err">{errors.password}</div>}
              </div>

              <div>
                <label>Phone</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  aria-label="Phone"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="u-auth-actions">
              <button className="u-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            <div className="u-alt-login">
              Already shopping with us? <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </div>
      </div>

      <Notification message={notif.message} type={notif.type} visible={notif.visible} />
    </>
  );
}
