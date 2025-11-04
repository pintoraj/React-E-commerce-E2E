import React from 'react';
import { useParams } from 'react-router-dom';
import './User.css';

export default function User() {
  const { username } = useParams();
  return (
    <div className="u-container" style={{ paddingTop: 32 }}>
      <div className="u-hero-card" style={{ textAlign: 'center' }}>
        <h1>Welcome, {username}</h1>
        <p>Your dashboard is under process. Use the header dropdown to go to Profile or Home.</p>
      </div>
    </div>
  );
}
