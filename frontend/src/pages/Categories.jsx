import { useState, useEffect, useMemo } from 'react';
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
  FiPackage,
  FiInbox,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import ProductCard from '../components/home/FeaturedProducts/ProductCard';
import './Categories.css';

// Preset Category Visual Style Mapping
const CATEGORY_STYLE_MAP = {
  'electronics': { icon: FiMonitor, color: '#d97706', bg: '#fef3c7' },
  'fashion': { icon: FiShoppingBag, color: '#2563eb', bg: '#dbeafe' },
  'mobiles': { icon: FiSmartphone, color: '#059669', bg: '#d1fae5' },
  'appliances': { icon: FiTv, color: '#dc2626', bg: '#fee2e2' },
  'beauty': { icon: FiSmile, color: '#db2777', bg: '#fce7f3' },
  'books': { icon: FiBook, color: '#4f46e5', bg: '#e0e7ff' },
  'sports': { icon: FiActivity, color: '#0284c7', bg: '#e0f2fe' },
  'groceries': { icon: FiShoppingCart, color: '#16a34a', bg: '#dcfce7' },
  'home & kitchen': { icon: FiHome, color: '#ca8a04', bg: '#fef9c3' },
};

const COLOR_PALETTE = [
  { color: '#2563eb', bg: '#dbeafe' },
  { color: '#059669', bg: '#d1fae5' },
  { color: '#dc2626', bg: '#fee2e2' },
  { color: '#d97706', bg: '#fef3c7' },
  { color: '#db2777', bg: '#fce7f3' },
  { color: '#4f46e5', bg: '#e0e7ff' },
  { color: '#0284c7', bg: '#e0f2fe' },
  { color: '#16a34a', bg: '#dcfce7' },
  { color: '#ca8a04', bg: '#fef9c3' },
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

  // 1. Group products dynamically by their exact category name from database
  const categoryGroups = useMemo(() => {
    const groups = {};
    for (const prod of allProducts) {
      const cat = (prod.category || 'Other').trim();
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(prod);
    }
    return groups;
  }, [allProducts]);

  // 2. Extract unique available category names dynamically (ONLY categories present in shop)
  const availableCategories = useMemo(() => {
    return Object.keys(categoryGroups);
  }, [categoryGroups]);

  // 3. Dynamically build left sidebar list matching right-side category order exactly
  const sidebarItems = useMemo(() => {
    const items = [
      {
        id: 'all',
        label: 'For You',
        icon: FiGrid,
        color: '#9333ea',
        bg: '#f3e8ff',
      },
    ];

    availableCategories.forEach((catName, idx) => {
      const key = catName.toLowerCase();
      const preset = CATEGORY_STYLE_MAP[key] || {
        icon: FiPackage,
        ...COLOR_PALETTE[idx % COLOR_PALETTE.length],
      };

      items.push({
        id: catName,
        label: catName,
        icon: preset.icon,
        color: preset.color,
        bg: preset.bg,
      });
    });

    return items;
  }, [availableCategories]);

  return (
    <div className="fk-categories-wrapper">
      {/* Flipkart Split-Pane Container */}
      <div className="fk-categories-container">
        {/* Dynamic Left Vertical Sidebar Navigation (Contains ONLY Categories Present in Shop) */}
        <aside className="fk-cat-sidebar">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeCat === item.id;

            return (
              <button
                key={item.id}
                className={`fk-cat-sidebar-item ${isActive ? 'fk-cat-sidebar-item--active' : ''}`}
                onClick={() => setActiveCat(item.id)}
              >
                <div
                  className="fk-cat-sidebar-icon-avatar"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  <IconComponent size={20} />
                </div>
                <span className="fk-cat-sidebar-label">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Main Content Area (Organized in exact matching category order) */}
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

          {/* When "For You" (All) is selected: Render Products Grouped in Exact Sidebar Category Order */}
          {!loading && !error && activeCat === 'all' && (
            <div className="fk-cat-separated-groups">
              {availableCategories.map((catName) => (
                <section key={catName} className="fk-cat-group-block">
                  <div className="fk-cat-group-header">
                    <h3 className="fk-cat-group-title">{catName}</h3>
                    <span className="fk-cat-group-count">
                      {categoryGroups[catName].length} {categoryGroups[catName].length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="fk-cat-products-grid">
                    {categoryGroups[catName].map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* When a Specific Category Tab is Selected from Sidebar */}
          {!loading && !error && activeCat !== 'all' && (
            <section className="fk-cat-group-block">
              <div className="fk-cat-group-header">
                <h3 className="fk-cat-group-title">{activeCat}</h3>
                <span className="fk-cat-group-count">
                  {(categoryGroups[activeCat] || []).length} {(categoryGroups[activeCat] || []).length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {categoryGroups[activeCat] && categoryGroups[activeCat].length > 0 ? (
                <div className="fk-cat-products-grid">
                  {categoryGroups[activeCat].map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="fk-cat-message">
                  <FiInbox size={24} />
                  <p>No products in {activeCat}</p>
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
