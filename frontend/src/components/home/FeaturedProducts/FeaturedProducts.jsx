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
      // API returns { success: true, count: X, data: [ ... ] }
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
      {/* Header */}
      <div className="featured-products-header">
        <span className="featured-products-badge">Our Picks</span>
        <h2 className="featured-products-title">Featured Products</h2>
        <p className="featured-products-subtitle">
          Explore our top recommendation products curated just for you.
        </p>
      </div>

      {/* States: Loading, Error, Empty, Grid */}
      {loading && (
        <div className="featured-products-loader">
          <div className="featured-products-spinner" />
          <p>Loading Products...</p>
        </div>
      )}

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

      {!loading && !error && products.length === 0 && (
        <div className="featured-products-message">
          <FiInbox className="featured-products-message-icon" />
          <h3 className="featured-products-message-title">No products available.</h3>
          <p className="featured-products-message-text">
            Check back later for exciting additions to our collection.
          </p>
        </div>
      )}

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
