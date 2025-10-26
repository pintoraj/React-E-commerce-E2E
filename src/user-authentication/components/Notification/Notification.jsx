import React from 'react';
import './Notification.css';

/**
 * Props:
 * - message: string
 * - type: 'success'|'error'|'info'
 * - visible: boolean
 */
export default function Notification({ message = '', type = 'info', visible = false }) {
  return (
    <div className={`u-notif-wrap ${visible ? 'u-show' : ''}`} aria-live="polite">
      <div className={`u-notif u-${type}`}>
        <div className="u-notif-body">{message}</div>
      </div>
    </div>
  );
}
