import { useState, useEffect } from 'react';
import { FiAlertCircle, FiFolderMinus, FiRefreshCw } from 'react-icons/fi';
import api from '../../../api/axios';
import { CATEGORY_ENDPOINTS } from '../../../constants';
import CategoryCard from './CategoryCard';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.LIST);
      // API returns { success: true, count: X, data: [ ... ] }
      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data.filter(cat => cat.isActive !== false));
      } else {
        throw new Error('Invalid format received from server');
      }
    } catch (err) {
      console.error('Fetch categories failure:', err);
      setError('Could not retrieve product categories. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="categories-section" id="categories">
      {/* Header */}
      <div className="categories-header">
        <span className="categories-header__badge">Shop by Type</span>
        <h2 className="categories-header__title">Browse Categories</h2>
        <p className="categories-header__subtitle">
          Find the best items organized by product style and category.
        </p>
      </div>

      {/* States: Loading, Error, Empty, Grid */}
      {loading && (
        <div className="categories-loader">
          <div className="categories-loader__spinner" />
          <p>Loading categories...</p>
        </div>
      )}

      {!loading && error && (
        <div className="categories-message-box">
          <FiAlertCircle className="categories-message-box__icon" />
          <h3 className="categories-message-box__title">Something went wrong</h3>
          <p className="categories-message-box__text">{error}</p>
          <button className="categories-message-box__btn" onClick={fetchCategories}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="categories-message-box">
          <FiFolderMinus className="categories-message-box__icon" />
          <h3 className="categories-message-box__title">No categories found</h3>
          <p className="categories-message-box__text">
            We couldn't find any active product categories right now.
          </p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Categories;
