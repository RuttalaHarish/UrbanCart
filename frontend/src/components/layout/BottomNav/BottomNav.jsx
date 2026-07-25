import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useAuth } from '../../../context/AuthContext';
import './BottomNav.css';

function BottomNav() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const profilePath = isAuthenticated
    ? user?.role === 'admin'
      ? '/admin/dashboard'
      : '/profile'
    : '/login';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiHome size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/categories"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiGrid size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Categories</span>
      </NavLink>

      <NavLink
        to="/shop"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiShoppingBag size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Shop</span>
      </NavLink>

      <NavLink
        to="/wishlist"
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
