import { useState, useEffect } from 'react';
import {
  FiGrid,
  FiShoppingBag,
  FiSmartphone,
  FiTv,
  FiMonitor,
  FiActivity,
  FiSmile,
  FiBook,
  FiShoppingCart,
  FiHome,
  FiInbox,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import ProductCard from '../components/home/FeaturedProducts/ProductCard';
import './Categories.css';

const CATEGORY_SIDEBAR = [
  { id: 'all', label: 'For You', icon: FiGrid, color: '#9333ea', bg: '#f3e8ff' },
  { id: 'fashion', label: 'Fashion', icon: FiShoppingBag, color: '#2563eb', bg: '#dbeafe' },
  { id: 'mobiles', label: 'Mobiles', icon: FiSmartphone, color: '#059669', bg: '#d1fae5' },
  { id: 'appliances', label: 'Appliances', icon: FiTv, color: '#dc2626', bg: '#fee2e2' },
  { id: 'electronics', label: 'Electronics', icon: FiMonitor, color: '#d97706', bg: '#fef3c7' },
  { id: 'beauty', label: 'Beauty', icon: FiSmile, color: '#db2777', bg: '#fce7f3' },
  { id: 'books', label: 'Books', icon: FiBook, color: '#4f46e5', bg: '#e0e7ff' },
  { id: 'sports', label: 'Sports', icon: FiActivity, color: '#0284c7', bg: '#e0f2fe' },
  { id: 'groceries', label: 'Groceries', icon: FiShoppingCart, color: '#16a34a', bg: '#dcfce7' },
  { id: 'home & kitchen', label: 'Home & Kitchen', icon: FiHome, color: '#ca8a04', bg: '#fef9c3' },
];

function Categories() {
  const [activeCat, setActiveCat] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`${PRODUCT_ENDPOINTS.LIST}?limit=100`);
      if (response.data && Array.isArray(response.data.data)) {
        setAllProducts(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Unable to load categories. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Group products category-wise
  const groupedProducts = allProducts.reduce((acc, prod) => {
    const catName = (prod.category || 'Uncategorized').trim();
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(prod);
    return acc;
  }, {});

  const currentCategoryInfo = CATEGORY_SIDEBAR.find((c) => c.id === activeCat) || CATEGORY_SIDEBAR[0];

  // Filter products by active category selection
  const filteredProducts = activeCat === 'all'
    ? allProducts
    : allProducts.filter((p) => (p.category || '').trim().toLowerCase() === activeCat);

  return (
    <div className="fk-categories-wrapper">
      {/* Flipkart Split-Pane Container */}
      <div className="fk-categories-container">
        {/* Left Vertical Category Navigation Sidebar (Home Option Removed) */}
        <aside className="fk-cat-sidebar">
          {CATEGORY_SIDEBAR.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = activeCat === cat.id;

            return (
              <button
                key={cat.id}
                className={`fk-cat-sidebar-item ${isActive ? 'fk-cat-sidebar-item--active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >
                <div
                  className="fk-cat-sidebar-icon-avatar"
                  style={{ backgroundColor: cat.bg, color: cat.color }}
                >
                  <IconComponent size={20} />
                </div>
                <span className="fk-cat-sidebar-label">{cat.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Content Area (Separated Category-Wise) */}
        <main className="fk-cat-main-content">
          {loading && (
            <div className="fk-cat-skeleton-grid">
              <div className="fk-cat-skeleton-card" />
              <div className="fk-cat-skeleton-card" />
              <div className="fk-cat-skeleton-card" />
              <div className="fk-cat-skeleton-card" />
            </div>
          )}

          {!loading && error && (
            <div className="fk-cat-message">
              <FiAlertTriangle size={24} style={{ color: 'var(--color-error)' }} />
              <p>{error}</p>
              <button className="fk-cat-retry-btn" onClick={fetchProducts}>
                <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
              </button>
            </div>
          )}

          {!loading && !error && allProducts.length === 0 && (
            <div className="fk-cat-message">
              <FiInbox size={28} />
              <p>No products found.</p>
            </div>
          )}

          {/* When "For You" (All) is selected: Render Products Grouped Category-Wise */}
          {!loading && !error && activeCat === 'all' && (
            <div className="fk-cat-separated-groups">
              {Object.keys(groupedProducts).map((catName) => (
                <section key={catName} className="fk-cat-group-block">
                  <div className="fk-cat-group-header">
                    <h3 className="fk-cat-group-title">{catName}</h3>
                    <span className="fk-cat-group-count">
                      {groupedProducts[catName].length} items
                    </span>
                  </div>
                  <div className="fk-cat-products-grid">
                    {groupedProducts[catName].map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* When a Specific Category Tab is Selected */}
          {!loading && !error && activeCat !== 'all' && (
            <section className="fk-cat-group-block">
              <div className="fk-cat-group-header">
                <h3 className="fk-cat-group-title">{currentCategoryInfo.label}</h3>
                <span className="fk-cat-group-count">
                  {filteredProducts.length} items
                </span>
              </div>
              {filteredProducts.length > 0 ? (
                <div className="fk-cat-products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="fk-cat-message">
                  <FiInbox size={24} />
                  <p>No products in {currentCategoryInfo.label}</p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Categories;
