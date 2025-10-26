import React from 'react';
import './Contact.css';

export default function Contact() {
  return (
    <div className="u-auth-page">
      <div className="u-contact-card">
        <h2 className="u-title">Contact Us</h2>
        <p className="u-subtitle">We’d love to hear from you</p>
        <form className="u-contact-form">
          <label>Name</label>
          <input placeholder="Your name" />
          <label>Email</label>
          <input placeholder="Your email" />
          <label>Message</label>
          <textarea placeholder="Type your message" rows="6" />
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button className="u-btn u-primary">Send Message</button>
          </div>
        </form>
      </div>
    </div>
  );
}
