import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiLogIn,
  FiPackage,
  FiMapPin,
  FiChevronRight,
  FiCamera,
  FiGrid,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/categories', label: 'Categories' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const navLinks = isAdmin
    ? [...NAV_LINKS, { to: '/admin/dashboard', label: 'Admin Dashboard' }]
    : NAV_LINKS;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim();
      if (q) {
        navigate(`/shop?q=${encodeURIComponent(q)}`);
      } else {
        navigate('/shop');
      }
      setMobileOpen(false);
    }
  };

  return (
    <header className="navbar-header">
      {/* ===== Flipkart Mobile-Specific Header Layout (Only Visible on Mobile <= 768px) ===== */}
      <div className="flipkart-mobile-header">
        {/* Tier 1: Brand Switcher Pills */}
        <div className="flipkart-mobile-pills-row">
          <div className="flipkart-brand-pill" onClick={() => navigate('/')}>
            <span className="flipkart-brand-pill__bold">⚡ Urban</span>
            <span className="flipkart-brand-pill__italic">Cart</span>
          </div>
          <div className="flipkart-travel-pill" onClick={() => navigate('/shop')}>
            <span className="flipkart-travel-pill__icon">✈️</span> Travel
          </div>
        </div>

        {/* Tier 2: Location Delivery Bar & SuperCoins Badge */}
        <div className="flipkart-mobile-location-row">
          <div className="flipkart-location-info">
            <FiMapPin className="flipkart-location-icon" size={14} />
            <span className="flipkart-location-text">Deliver to Select Location</span>
            <FiChevronRight className="flipkart-location-chevron" size={14} />
          </div>
          <div className="flipkart-coins-badge">
            <FiZap size={12} className="flipkart-coins-icon" /> 0
          </div>
        </div>

        {/* Tier 3: Prominent Full Width Search Bar */}
        <div className="flipkart-mobile-search-row">
          <FiSearch className="flipkart-search-icon" size={18} />
          <input
            type="text"
            className="flipkart-mobile-search-input"
            placeholder="Search for Products, Brands and More"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <div className="flipkart-search-actions">
            <FiCamera size={18} className="flipkart-camera-icon" />
            <FiGrid size={18} className="flipkart-grid-icon" />
          </div>
        </div>
      </div>

      {/* ===== Standard Desktop Container (Hidden on Mobile) ===== */}
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo">
          Urban<span>Cart</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <ul className="navbar-links">
            {navLinks.map((link) => (
              <li key={link.to} className="navbar-link-item">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Search */}
        <div className="navbar-search">
          <span className="navbar-search__icon">
            <FiSearch size={14} />
          </span>
          <input
            type="text"
            className="navbar-search__input"
            placeholder="Search for Products, Brands and More"
            aria-label="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {/* Wishlist */}
          <Link to="/wishlist" className="navbar-wishlist-btn" aria-label="Wishlist">
            <FiHeart size={20} />
            {wishlistCount > 0 && (
              <span className="navbar-wishlist-count">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="navbar-cart-btn" aria-label="Shopping Cart">
            <FiShoppingCart size={20} />
            <span className="navbar-cart-count">{cartCount}</span>
          </Link>

          {/* Auth / Profile */}
          {isAuthenticated ? (
            <div className="navbar-profile" ref={profileRef}>
              <button
                className="navbar-profile-btn"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Account menu"
              >
                <FiUser size={16} />
                {user?.name?.split(' ')[0] || 'Account'}
              </button>

              {profileOpen && (
                <div className="navbar-profile-dropdown">
                  <Link
                    to="/profile"
                    className="navbar-profile-dropdown__item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FiUser size={14} />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className="navbar-profile-dropdown__item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <FiPackage size={14} />
                    My Orders
                  </Link>
                  <hr className="navbar-profile-dropdown__divider" />
                  <button
                    className="navbar-profile-dropdown__item navbar-profile-dropdown__item--danger"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn">
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-nav-toggle"
            aria-label="Toggle Menu"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu size={24} />
          </button>
        </div>
      </div>

      {/* ===== Mobile Menu Drawer ===== */}
      <div
        className={`mobile-nav-overlay ${mobileOpen ? 'mobile-nav-overlay--open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <div className={`mobile-nav-menu ${mobileOpen ? 'mobile-nav-menu--open' : ''}`}>
        <button
          className="mobile-nav-menu__close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <FiX size={22} />
        </button>

        {/* Mobile Search */}
        <div className="mobile-nav-menu__search">
          <span className="navbar-search__icon">
            <FiSearch size={14} />
          </span>
          <input
            type="text"
            className="navbar-search__input"
            placeholder="Search for Products, Brands and More"
            aria-label="Search products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {/* Mobile Nav Links */}
        <ul className="mobile-nav-menu__links">
          {navLinks.map((link) => (
            <li key={link.to} className="mobile-nav-menu__link">
              <NavLink
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <hr className="mobile-nav-menu__divider" />

        {/* Mobile Actions */}
        <div className="mobile-nav-menu__actions">
          <Link
            to="/wishlist"
            className="mobile-nav-menu__action-btn"
            onClick={() => setMobileOpen(false)}
          >
            <FiHeart size={18} />
            Wishlist
            {wishlistCount > 0 && (
              <span className="mobile-nav-badge">{wishlistCount}</span>
            )}
          </Link>
          <Link
            to="/cart"
            className="mobile-nav-menu__action-btn"
            onClick={() => setMobileOpen(false)}
          >
            <FiShoppingCart size={18} />
            Cart
          </Link>

          <hr className="mobile-nav-menu__divider" />

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="mobile-nav-menu__action-btn"
                onClick={() => setMobileOpen(false)}
              >
                <FiUser size={18} />
                My Profile
              </Link>
              <Link
                to="/my-orders"
                className="mobile-nav-menu__action-btn"
                onClick={() => setMobileOpen(false)}
              >
                <FiPackage size={18} />
                My Orders
              </Link>
              <button
                className="mobile-nav-menu__action-btn mobile-nav-menu__action-btn--danger"
                onClick={handleLogout}
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mobile-nav-menu__action-btn"
              onClick={() => setMobileOpen(false)}
            >
              <FiLogIn size={18} />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
