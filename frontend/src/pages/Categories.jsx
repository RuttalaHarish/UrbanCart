import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGift,
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
  FiArrowRight,
} from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import ProductCard from '../components/home/FeaturedProducts/ProductCard';
import './Categories.css';

const CATEGORY_SIDEBAR = [
  { id: 'all', label: 'For You', icon: FiGift, color: '#9333ea', bg: '#f3e8ff' },
  { id: 'fashion', label: 'Fashion', icon: FiShoppingBag, color: '#2563eb', bg: '#dbeafe' },
  { id: 'mobiles', label: 'Mobiles', icon: FiSmartphone, color: '#059669', bg: '#d1fae5' },
  { id: 'appliances', label: 'Appliances', icon: FiTv, color: '#dc2626', bg: '#fee2e2' },
  { id: 'electronics', label: 'Electronics', icon: FiMonitor, color: '#d97706', bg: '#fef3c7' },
  { id: 'beauty', label: 'Beauty', icon: FiSmile, color: '#db2777', bg: '#fce7f3' },
  { id: 'books', label: 'Books', icon: FiBook, color: '#4f46e5', bg: '#e0e7ff' },
  { id: 'sports', label: 'Sports', icon: FiActivity, color: '#0284c7', bg: '#e0f2fe' },
  { id: 'groceries', label: 'Groceries', icon: FiShoppingCart, color: '#16a34a', bg: '#dcfce7' },
  { id: 'home & kitchen', label: 'Home', icon: FiHome, color: '#ca8a04', bg: '#fef9c3' },
];

const SPOTLIGHT_ITEMS = [
  { label: 'Live Now!', tag: 'Spring/Summer', color: '#fef08a' },
  { label: 'Shop Now', tag: 'Monsoon Store', color: '#e0f2fe' },
  { label: 'Sports Store', tag: 'Top Brands', color: '#fee2e2' },
  { label: 'Trendy Street', tag: 'GenZ Style', color: '#fce7f3' },
  { label: 'Wedding Store', tag: 'Ethnic', color: '#fef3c7' },
  { label: 'House of Brands', tag: 'Originals', color: '#d1fae5' },
];

function Categories() {
  const [activeCat, setActiveCat] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  // Filter products by selected sidebar category
  const filteredProducts = activeCat === 'all'
    ? allProducts
    : allProducts.filter((p) => (p.category || '').trim().toLowerCase() === activeCat);

  const currentCategoryInfo = CATEGORY_SIDEBAR.find((c) => c.id === activeCat) || CATEGORY_SIDEBAR[0];

  return (
    <div className="fk-categories-wrapper">
      {/* Flipkart Split-Pane Container */}
      <div className="fk-categories-container">
        {/* Left Vertical Category Navigation Sidebar */}
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

        {/* Right Main Content Area */}
        <main className="fk-cat-main-content">
          {/* Active Category Header Banner */}
          <div
            className="fk-cat-hero-banner"
            onClick={() => navigate(`/shop?category=${encodeURIComponent(currentCategoryInfo.label)}`)}
          >
            <div className="fk-cat-hero-info">
              <h2 className="fk-cat-hero-title">{currentCategoryInfo.label}</h2>
              <span className="fk-cat-hero-cta">
                Shop Collection <FiArrowRight size={14} />
              </span>
            </div>
            <div
              className="fk-cat-hero-avatar"
              style={{ backgroundColor: currentCategoryInfo.bg, color: currentCategoryInfo.color }}
            >
              <currentCategoryInfo.icon size={36} />
            </div>
          </div>

          {/* In the Spotlight Section */}
          <section className="fk-spotlight-section">
            <h3 className="fk-spotlight-heading">In the Spotlight</h3>
            <div className="fk-spotlight-grid">
              {SPOTLIGHT_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="fk-spotlight-card"
                  onClick={() => navigate('/shop')}
                >
                  <div
                    className="fk-spotlight-icon-box"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="fk-spotlight-tag">{item.tag}</span>
                  </div>
                  <span className="fk-spotlight-label">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Category Products Grid Section */}
          <section className="fk-cat-products-section">
            <h3 className="fk-spotlight-heading">
              {currentCategoryInfo.label} ({filteredProducts.length})
            </h3>

            {loading && (
              <div className="fk-cat-skeleton-grid">
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

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="fk-cat-message">
                <FiInbox size={28} />
                <p>No products found in this category.</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="fk-cat-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Categories;
