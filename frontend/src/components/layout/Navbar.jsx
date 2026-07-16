import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          Urban<span>Cart</span>
        </Link>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <ul className="navbar-links">
            <li className="navbar-link-item">
              <Link to="/">Home</Link>
            </li>
            <li className="navbar-link-item">
              <a href="#shop" onClick={(e) => e.preventDefault()}>Shop</a>
            </li>
            <li className="navbar-link-item">
              <a href="#categories" onClick={(e) => e.preventDefault()}>Categories</a>
            </li>
            <li className="navbar-link-item">
              <a href="#about" onClick={(e) => e.preventDefault()}>About</a>
            </li>
            <li className="navbar-link-item">
              <a href="#contact" onClick={(e) => e.preventDefault()}>Contact</a>
            </li>
          </ul>
        </nav>

        {/* Action button placeholders */}
        <div className="navbar-actions">
          {/* Cart Icon Placeholder */}
          <button className="navbar-cart-btn" aria-label="Shopping Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="navbar-cart-count">0</span>
          </button>

          {/* Login Button Placeholder */}
          <button className="navbar-login-btn">
            Login
          </button>

          {/* Mobile menu toggle */}
          <button className="mobile-nav-toggle" aria-label="Toggle Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
