import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
} from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import './BottomNav.css';

function BottomNav() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        onClick={handleNavClick}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiHome size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/categories"
        onClick={handleNavClick}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiGrid size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Categories</span>
      </NavLink>

      <NavLink
        to="/shop"
        onClick={handleNavClick}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiShoppingBag size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Shop</span>
      </NavLink>

      <NavLink
        to="/wishlist"
        onClick={handleNavClick}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <div className="bottom-nav-icon-wrapper">
          <FiHeart size={20} className="bottom-nav-icon" />
          {wishlistCount > 0 && (
            <span className="bottom-nav-badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Wishlist</span>
      </NavLink>

      <NavLink
        to="/cart"
        onClick={handleNavClick}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <div className="bottom-nav-icon-wrapper">
          <FiShoppingCart size={20} className="bottom-nav-icon" />
          {cartCount > 0 && (
            <span className="bottom-nav-badge bottom-nav-badge--yellow">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Cart</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
