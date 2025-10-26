import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="u-site-footer">
      <div className="u-footer-inner">
        <div className="u-col u-brand-col">
          <div className="u-brand-row">
            <div className="u-logo-square" />
            <div>
              <div className="u-footer-brand">E4Everything</div>
              <div className="u-footer-sub">Empowering merchants with great tooling.</div>
            </div>
          </div>
        </div>

        <div className="u-col u-links-col">
          <h4>Explore</h4>
          <nav>
            <a href="/">Homepage</a>
            <a href="/#deals">Deals</a>
            <a href="/#new-arrivals">New Arrivals</a>
            <a href="/shop">Shop</a>
          </nav>
        </div>

        <div className="u-col u-contact-col">
          <h4>Contact</h4>
          <div className="u-contact-item">
            <strong>Email:</strong>{' '}
            <a href="mailto:support@example.com">support@cognizant.com</a>
          </div>
          <div className="u-contact-item">
            <strong>Phone:</strong>{' '}
            <a href="tel:+11234567890">+91 9876543210</a>
          </div>
          <div className="u-socials">
            <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer">Fb</a>
            <a aria-label="X" href="https://twitter.com" target="_blank" rel="noreferrer">X</a>
            <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer">In</a>
            <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer">Ig</a>
          </div>
        </div>
      </div>

      <div className="u-copyright">
        © {new Date().getFullYear()} E4Everything. All rights reserved. · Built with care.
      </div>
    </footer>
  );
}
