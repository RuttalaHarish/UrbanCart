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
} from 'react-icons/fi';
import api from '../../../api/axios';
import { PRODUCT_ENDPOINTS } from '../../../constants';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { formatCurrency } from '../../../utils/formatCurrency';
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
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const profileRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Live autocomplete search effect with debouncing
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`${PRODUCT_ENDPOINTS.LIST}?q=${encodeURIComponent(q)}&limit=6`);
        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.products || [];
        setSearchResults(items);
        setShowDropdown(true);
      } catch (err) {
        console.error('Live search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close profile and search dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
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
      setShowDropdown(false);
      if (q) {
        navigate(`/shop?q=${encodeURIComponent(q)}`);
      } else {
        navigate('/shop');
      }
      setMobileOpen(false);
    }
  };

  const renderSearchDropdown = () => {
    if (!showDropdown || !searchQuery.trim()) return null;

    return (
      <div className="navbar-search-dropdown">
        {isSearching ? (
          <div className="search-dropdown-loading">Searching items...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((product) => (
            <div
              key={product._id}
              className="search-dropdown-item"
              onClick={() => {
                setShowDropdown(false);
                setSearchQuery('');
                navigate(`/products/${product._id}`);
              }}
            >
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/40'}
                alt={product.name}
                className="search-dropdown-img"
              />
              <div className="search-dropdown-info">
                <span className="search-dropdown-name">{product.name}</span>
                <span className="search-dropdown-meta">
                  {product.category} • {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="search-dropdown-empty">No products found matching "{searchQuery}"</div>
        )}
      </div>
    );
  };

  return (
    <header className="navbar-header">
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

        {/* Desktop Search Box with Live Dropdown */}
        <div className="navbar-search" ref={desktopSearchRef}>
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
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            onKeyDown={handleSearch}
          />
          {renderSearchDropdown()}
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

      {/* ===== Mobile Direct Search Bar Row with Live Dropdown ===== */}
      <div className="mobile-search-bar-row" ref={mobileSearchRef}>
        <span className="mobile-search-icon-wrapper">
          <FiSearch size={15} />
        </span>
        <input
          type="text"
          className="mobile-search-bar-input"
          placeholder="Search for Products, Brands and More"
          aria-label="Search products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setShowDropdown(true)}
          onKeyDown={handleSearch}
        />
        {renderSearchDropdown()}
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

        {/* Mobile Search inside Menu */}
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
