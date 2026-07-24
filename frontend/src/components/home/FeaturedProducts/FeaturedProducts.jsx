import { useState, useEffect } from 'react';
import { FiAlertCircle, FiInbox, FiRefreshCw } from 'react-icons/fi';
import api from '../../../api/axios';
import { PRODUCT_ENDPOINTS } from '../../../constants';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.LIST);
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        throw new Error('Invalid format received from server');
      }
    } catch (err) {
      console.error('Fetch products failure:', err);
      setError('Unable to load products. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="featured-products" id="featured-products">
      {/* Section Header */}
      <div className="featured-products-header">
        <span className="featured-products-badge">Hand-picked</span>
        <h2 className="featured-products-title">Featured Products</h2>
        <p className="featured-products-subtitle">
          Hand-picked products recommended for you.
        </p>
      </div>

      {/* Professional Product Card Skeleton Loader */}
      {loading && (
        <div className="featured-products-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="product-card-skeleton">
              <div className="skeleton-media" />
              <div className="skeleton-body">
                <div className="skeleton-badge-line" />
                <div className="skeleton-title" />
                <div className="skeleton-price" />
                <div className="skeleton-actions" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message Box */}
      {!loading && error && (
        <div className="featured-products-message">
          <FiAlertCircle className="featured-products-message-icon" />
          <h3 className="featured-products-message-title">Unable to load products</h3>
          <p className="featured-products-message-text">{error}</p>
          <button className="featured-products-retry-btn" onClick={fetchProducts}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      )}

      {/* Empty State Box */}
      {!loading && !error && products.length === 0 && (
        <div className="featured-products-message">
          <FiInbox className="featured-products-message-icon" />
          <h3 className="featured-products-message-title">No products available.</h3>
          <p className="featured-products-message-text">
            Check back later for exciting additions to our collection.
          </p>
        </div>
      )}

      {/* MongoDB Products Responsive Grid (All Available Shop Products) */}
      {!loading && !error && products.length > 0 && (
        <div className="featured-products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedProducts;
