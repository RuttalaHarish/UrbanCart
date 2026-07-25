import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiPlay,
  FiGrid,
  FiUser,
  FiShoppingCart,
} from 'react-icons/fi';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import './BottomNav.css';

function BottomNav() {
  const { cartCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  const accountPath = isAuthenticated
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
        to="/shop"
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiPlay size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Shop</span>
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
        to={accountPath}
        className={({ isActive }) =>
          `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
        }
      >
        <FiUser size={20} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Account</span>
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
            <span className="bottom-nav-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Cart</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
