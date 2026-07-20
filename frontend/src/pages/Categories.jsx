import { useState, useEffect } from 'react';
import { FiInbox, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import ProductCard from '../components/home/FeaturedProducts/ProductCard';
import './Categories.css';

function Categories() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasProducts, setHasProducts] = useState(false);

  const fetchAndGroupProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.LIST);
      // GET /api/products returns { success: true, count: X, data: [ ... ] }
      if (response.data && Array.isArray(response.data.data)) {
        const productsList = response.data.data;
        if (productsList.length > 0) {
          setHasProducts(true);
          // Group products by category
          const groups = productsList.reduce((acc, curr) => {
            const cat = curr.category || 'uncategorized';
            if (!acc[cat]) {
              acc[cat] = [];
            }
            acc[cat].push(curr);
            return acc;
          }, {});
          setGroupedProducts(groups);
        } else {
          setHasProducts(false);
          setGroupedProducts({});
        }
      } else {
        throw new Error('Invalid format received from server');
      }
    } catch (err) {
      console.error('Fetch categories/products failure:', err);
      setError('Unable to load categories. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGroupProducts();
  }, []);

  return (
    <div className="container categories-page">
      {/* Page Header */}
      <div className="categories-header">
        <span className="categories-title-badge">Browse Categories</span>
        <h1 className="categories-title">Products by Category</h1>
        <p className="categories-subtitle">
          Explore our items catalog cleanly separated into specialized categories.
        </p>
      </div>

      {/* Skeletons Loader */}
      {loading && (
        <div className="categories-skeleton-group">
          <div className="categories-skeleton-header" />
          <div className="categories-skeleton-grid">
            <div className="categories-skeleton-card" />
            <div className="categories-skeleton-card" />
            <div className="categories-skeleton-card" />
            <div className="categories-skeleton-card" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="categories-message-box">
          <FiAlertTriangle className="categories-message-icon" style={{ color: 'var(--color-error)' }} />
          <h3 className="categories-message-title">Something went wrong</h3>
          <p className="categories-message-text">{error}</p>
          <button className="categories-retry-btn" onClick={fetchAndGroupProducts}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !hasProducts && (
        <div className="categories-message-box">
          <FiInbox className="categories-message-icon" />
          <h3 className="categories-message-title">No products found</h3>
          <p className="categories-message-text">
            We currently don't have any products categorized. Please try again later.
          </p>
        </div>
      )}

      {/* Category Groups list */}
      {!loading && !error && hasProducts && (
        <div className="categories-list-container">
          {Object.keys(groupedProducts).map((catName) => {
            const list = groupedProducts[catName];
            return (
              <section key={catName} className="category-group-section">
                <div className="category-group-header">
                  <div className="category-group-info">
                    <h2 className="category-group-name">{catName}</h2>
                    <span className="category-group-count">
                      {list.length} {list.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                </div>
                <div className="category-group-grid">
                  {list.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Categories;
