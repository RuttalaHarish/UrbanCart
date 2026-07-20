import { Link } from 'react-router-dom';
import {
  FiTwitter,
  FiInstagram,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import './Footer.css';

const QUICK_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const SUPPORT_LINKS = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Shipping Info', href: '#shipping' },
  { label: 'Returns & Exchanges', href: '#returns' },
  { label: 'Order Tracking', href: '#tracking' },
  { label: 'Privacy Policy', href: '#privacy' },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  const handlePlaceholderClick = (e) => e.preventDefault();

  return (
    <footer className="footer-shell">
      <div className="container">
        {/* Footer Top Grid — 4 Columns */}
        <div className="footer-grid--extended">
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Urban<span>Cart</span>
            </Link>
            <p className="footer-description">
              Your premium destination for modern, quality products.
              Built with care for a seamless shopping experience.
            </p>
            <div className="footer-social-icons">
              <a
                href="#twitter"
                aria-label="Twitter"
                className="footer-social-link"
                onClick={handlePlaceholderClick}
              >
                <FiTwitter size={18} />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="footer-social-link"
                onClick={handlePlaceholderClick}
              >
                <FiInstagram size={18} />
              </a>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="footer-social-link"
                onClick={handlePlaceholderClick}
              >
                <FiFacebook size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links-list">
              {QUICK_LINKS.map((link) => (
                <li key={link.to} className="footer-link-item">
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h4 className="footer-column-title">Customer Support</h4>
            <ul className="footer-links-list">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label} className="footer-link-item">
                  <a href={link.href} onClick={handlePlaceholderClick}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-newsletter__title">Newsletter</h4>
            <p className="footer-newsletter__text">
              Subscribe to get updates on new arrivals and exclusive offers.
            </p>
            <form
              className="footer-newsletter__form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                className="footer-newsletter__input"
                placeholder="Enter your email"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="footer-newsletter__btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} UrbanCart. All rights reserved.</p>
          <p>Built with ❤️ for modern e-commerce.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
