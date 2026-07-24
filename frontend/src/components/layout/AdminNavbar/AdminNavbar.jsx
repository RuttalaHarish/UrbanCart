import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiLayout, FiPackage, FiPlusSquare, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import './AdminNavbar.css';

function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-navbar-header">
      <div className="container admin-navbar-container">
        {/* Brand Logo / Title */}
        <Link to="/admin/dashboard" className="admin-navbar-logo">
          Urban<span>Cart</span>
          <span className="admin-navbar-logo-tag">Admin</span>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="admin-navbar-nav">
            <li className="admin-navbar-link">
              <NavLink to="/admin/dashboard">
                <FiLayout size={14} style={{ marginRight: '6px' }} />
                Dashboard
              </NavLink>
            </li>
            <li className="admin-navbar-link">
              <NavLink to="/admin/products" end>
                <FiPackage size={14} style={{ marginRight: '6px' }} />
                Products
              </NavLink>
            </li>
            <li className="admin-navbar-link">
              <NavLink to="/admin/products/add">
                <FiPlusSquare size={14} style={{ marginRight: '6px' }} />
                Add Product
              </NavLink>
            </li>
            <li className="admin-navbar-link">
              <NavLink to="/admin/orders">
                <FiShoppingBag size={14} style={{ marginRight: '6px' }} />
                Orders
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Logout Button */}
        <div>
          <button
            type="button"
            className="admin-navbar-logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
