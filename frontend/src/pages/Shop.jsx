import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiInbox, FiAlertTriangle, FiRefreshCw, FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import ProductCard from '../components/home/FeaturedProducts/ProductCard';
import './Shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const categoryParam = searchParams.get('category')?.trim() || '';

  // Derive filtered list from all products + URL query params (q & category)
  const filteredProducts = products.filter((p) => {
    const qLower = query.toLowerCase();
    const catLower = categoryParam.toLowerCase();

    const matchesQuery = !query || (
      p.name?.toLowerCase().includes(qLower) ||
      p.category?.toLowerCase().includes(qLower) ||
      p.brand?.toLowerCase().includes(qLower)
    );

    const matchesCategory = !categoryParam || (
      p.category && p.category.toLowerCase() === catLower
    );

    return matchesQuery && matchesCategory;
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.LIST);
      // GET /api/products returns { success: true, count: X, data: [ ... ] }
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        throw new Error('Invalid format received from server');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container shop-page">
      {/* Page Header */}
      <div className="shop-header">
        <span className="shop-title-badge">
          {query ? `Results for "${query}"` : 'All Products'}
        </span>
        <h1 className="shop-title">Shop Our Collection</h1>
        <p className="shop-subtitle">
          {query
            ? `Showing products matching "${query}"`
            : 'Discover a wide range of premium products selected for your convenience.'}
        </p>
      </div>

      {/* States: Loading, Error, Empty, Grid */}
      {loading && (
        <div className="shop-skeleton-grid">
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
        </div>
      )}

      {!loading && error && (
        <div className="shop-message-box">
          <FiAlertTriangle className="shop-message-icon" style={{ color: 'var(--color-error)' }} />
          <h3 className="shop-message-title">Something went wrong</h3>
          <p className="shop-message-text">{error}</p>
          <button className="shop-retry-btn" onClick={fetchProducts}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      )}

      {/* Catalog is empty (no products at all) */}
      {!loading && !error && products.length === 0 && (
        <div className="shop-message-box">
          <FiInbox className="shop-message-icon" />
          <h3 className="shop-message-title">No products available.</h3>
          <p className="shop-message-text">
            Our shelves are empty at the moment. Please come back later.
          </p>
        </div>
      )}

      {/* Search returned no matches */}
      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="shop-message-box">
          <FiSearch className="shop-message-icon" />
          <h3 className="shop-message-title">No products found.</h3>
          <p className="shop-message-text">
            We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try a different keyword.
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Shop;
