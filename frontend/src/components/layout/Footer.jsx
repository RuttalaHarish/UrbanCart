import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-shell">
      <div className="container">
        {/* Footer Top Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & Logo */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Urban<span>Cart</span>
            </Link>
            <p className="footer-description">
              A premium, modern design framework for seamless, next-generation web architectures. Built with style and scale in mind.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-column-title">Quick Links</h4>
            <ul className="footer-links-list">
              <li className="footer-link-item">
                <Link to="/">Home</Link>
              </li>
              <li className="footer-link-item">
                <a href="#shop" onClick={(e) => e.preventDefault()}>Shop</a>
              </li>
              <li className="footer-link-item">
                <a href="#categories" onClick={(e) => e.preventDefault()}>Categories</a>
              </li>
              <li className="footer-link-item">
                <a href="#about" onClick={(e) => e.preventDefault()}>About</a>
              </li>
              <li className="footer-link-item">
                <a href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Social Medias */}
          <div>
            <h4 className="footer-column-title">Follow Us</h4>
            <div className="footer-social-icons">
              <a href="#twitter" aria-label="Twitter" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#instagram" aria-label="Instagram" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#facebook" aria-label="Facebook" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} UrbanCart. All rights reserved.</p>
          <p>Designed for scalable layouts.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
