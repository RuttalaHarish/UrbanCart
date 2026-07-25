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
  const [searchParams, setSearchParams] = useSearchParams();

  // Single pagination state object storing backend pagination metadata
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12,
  });

  // Local states for inputs
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get('minPrice') || '');
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get('maxPrice') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');

  // Parse and validate URL query parameters for backend requests
  const rawPage = parseInt(searchParams.get('page'), 10);
  const currentPageParam = !isNaN(rawPage) && rawPage > 0 ? rawPage : 1;

  const query = searchParams.get('q')?.trim() || '';
  const categoryParam = searchParams.get('category')?.trim() || '';
  const minPrice = searchParams.get('minPrice')?.trim() || '';
  const maxPrice = searchParams.get('maxPrice')?.trim() || '';
  const sort = searchParams.get('sort')?.trim() || '';

  const hasActiveFilters = Boolean(query || categoryParam || minPrice || maxPrice || sort || currentPageParam > 1);
  const searchParamsString = searchParams.toString();

  // 1. Synchronize local input states whenever URL search parameters change (Back/Forward navigation, refresh, Clear Filters)
  useEffect(() => {
    setSearchInput(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setMinPriceInput(searchParams.get('minPrice') || '');
    setMaxPriceInput(searchParams.get('maxPrice') || '');
    setSelectedSort(searchParams.get('sort') || 'newest');
  }, [searchParamsString]);

  // 2. Debounced auto-apply effect for search, minPrice, and maxPrice text inputs (400ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      let isChanged = false;

      const trimmedQ = searchInput.trim();
      const currentQ = searchParams.get('q') || '';
      if (trimmedQ !== currentQ) {
        if (trimmedQ) {
          newParams.set('q', trimmedQ);
        } else {
          newParams.delete('q');
        }
        isChanged = true;
      }

      const trimmedMin = minPriceInput.trim();
      const currentMin = searchParams.get('minPrice') || '';
      if (trimmedMin !== currentMin) {
        if (trimmedMin) {
          newParams.set('minPrice', trimmedMin);
        } else {
          newParams.delete('minPrice');
        }
        isChanged = true;
      }

      const trimmedMax = maxPriceInput.trim();
      const currentMax = searchParams.get('maxPrice') || '';
      if (trimmedMax !== currentMax) {
        if (trimmedMax) {
          newParams.set('maxPrice', trimmedMax);
        } else {
          newParams.delete('maxPrice');
        }
        isChanged = true;
      }

      if (isChanged) {
        // Reset to page 1 on filter changes
        newParams.delete('page');
        setSearchParams(newParams, { replace: true });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, minPriceInput, maxPriceInput, searchParams, setSearchParams]);

  // 3. Fetch products from backend dynamically with pagination
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (categoryParam) params.append('category', categoryParam);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);

      // Append page parameter if > 1 and limit parameter for backend pagination
      if (currentPageParam > 1) {
        params.append('page', currentPageParam);
      }
      params.append('limit', pagination.limit || 12);

      const queryString = params.toString();
      const endpoint = queryString
        ? `${PRODUCT_ENDPOINTS.LIST}?${queryString}`
        : PRODUCT_ENDPOINTS.LIST;

      const response = await api.get(endpoint);

      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        // Store backend pagination metadata into React state
        setPagination({
          currentPage: response.data.currentPage || currentPageParam,
          totalPages: response.data.totalPages || 1,
          totalProducts: response.data.totalProducts || 0,
          limit: response.data.limit || 12,
        });
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

  // Re-fetch products from backend whenever URL search parameters change
  useEffect(() => {
    fetchProducts();
  }, [searchParamsString]);

  // Page change handler: updates page parameter in URL while preserving all active filters
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      newParams.set('page', newPage);
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  // Optional: Immediate submission if user presses Enter on search/price inputs
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const newParams = new URLSearchParams(searchParams);

      const trimmedQ = searchInput.trim();
      if (trimmedQ) newParams.set('q', trimmedQ); else newParams.delete('q');

      const trimmedMin = minPriceInput.trim();
      if (trimmedMin) newParams.set('minPrice', trimmedMin); else newParams.delete('minPrice');

      const trimmedMax = maxPriceInput.trim();
      if (trimmedMax) newParams.set('maxPrice', trimmedMax); else newParams.delete('maxPrice');

      newParams.delete('page');
      setSearchParams(newParams);
    }
  };

  // Immediate Category selection update
  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('category', val);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Immediate Sort selection update
  const handleSortChange = (e) => {
    const val = e.target.value;
    setSelectedSort(val);
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'newest') {
      newParams.set('sort', val);
    } else {
      newParams.delete('sort');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Immediate Clear Filters action
  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSelectedSort('newest');
    setSearchParams({});
  };

  return (
    <div className="container shop-page">
      {/* Filter Toolbar UI */}
      <div className="shop-toolbar">
        <div className="shop-search-wrapper">
          <FiSearch className="shop-search-icon" size={16} />
          <input
            type="text"
            className="shop-search-input"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        <select
          className="shop-filter-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Sports">Sports</option>
          <option value="Beauty">Beauty</option>
          <option value="Groceries">Groceries</option>
          <option value="Home & Kitchen">Home & Kitchen</option>
        </select>

        <div className="shop-price-group">
          <input
            type="number"
            className="shop-price-input"
            placeholder="Min Price"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
          <input
            type="number"
            className="shop-price-input"
            placeholder="Max Price"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        <select
          className="shop-filter-select"
          value={selectedSort}
          onChange={handleSortChange}
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price Low → High</option>
          <option value="price-desc">Price High → Low</option>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
        </select>

        <button
          type="button"
          className="shop-clear-btn"
          onClick={handleClearFilters}
        >
          Clear Filters
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="shop-skeleton-grid">
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
          <div className="shop-skeleton-card" />
        </div>
      )}

      {/* Error Message Box */}
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

      {/* Catalog empty state (No active filters and 0 products in store) */}
      {!loading && !error && !hasActiveFilters && products.length === 0 && (
        <div className="shop-message-box">
          <FiInbox className="shop-message-icon" />
          <h3 className="shop-message-title">No products available.</h3>
          <p className="shop-message-text">
            Our shelves are empty at the moment. Please come back later.
          </p>
        </div>
      )}

      {/* No search/filter matches state (Active filters returned 0 results from backend) */}
      {!loading && !error && hasActiveFilters && products.length === 0 && (
        <div className="shop-message-box">
          <FiSearch className="shop-message-icon" />
          <h3 className="shop-message-title">No products found.</h3>
          <p className="shop-message-text">
            {query
              ? `We couldn't find anything matching "${query}". Try a different keyword.`
              : 'No products match your selected filter criteria. Try adjusting your filters.'}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="shop-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination UI Controls */}
          {pagination.totalPages > 1 && (
            <div className="shop-pagination">
              <button
                type="button"
                className="shop-pagination-btn"
                disabled={currentPageParam <= 1}
                onClick={() => handlePageChange(currentPageParam - 1)}
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  className={`shop-pagination-num ${pNum === currentPageParam ? 'active' : ''}`}
                  onClick={() => handlePageChange(pNum)}
                >
                  {pNum}
                </button>
              ))}

              <button
                type="button"
                className="shop-pagination-btn"
                disabled={currentPageParam >= pagination.totalPages}
                onClick={() => handlePageChange(currentPageParam + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Shop;
