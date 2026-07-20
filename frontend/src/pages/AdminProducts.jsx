import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_STATUSES, PAYMENT_STATUSES, PRODUCT_ENDPOINTS, LOW_STOCK_THRESHOLD } from '../constants';
import { Loading, ErrorState } from '../components/common';
import '../styles/AdminProducts.css';

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.LIST);
      // GET /api/products returns { success: true, count: X, data: [ ... ] }
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        throw new Error('Invalid products structure received');
      }
    } catch (err) {
      console.error('Fetch admin products error:', err);
      setError('Unable to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (deletingId) return; // Prevent concurrent requests

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    setDeletingId(productId);
    try {
      const response = await api.delete(PRODUCT_ENDPOINTS.DELETE(productId));
      if (response.data && response.data.success) {
        toast.success('Product removed successfully.');
        fetchProducts();
      } else {
        throw new Error('Server returned unsuccessful deletion flag');
      }
    } catch (err) {
      console.error('Delete product error:', err);
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(serverMsg || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  // Derive unique categories dynamically
  const categories = [
    'All Categories',
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // Derive filtered products based on search AND category filters
  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim();
    
    // 1. Search Query filter (name, brand, or category string matching)
    const matchesSearch = !q || (
      (product.name && product.name.toLowerCase().includes(q)) ||
      (product.brand && product.brand.toLowerCase().includes(q)) ||
      (product.category && product.category.toLowerCase().includes(q))
    );

    // 2. Category selection filter
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'All Categories' ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchProducts} />;
  }

  return (
    <div className="container admin-products-page">
      {/* Header Block */}
      <div className="admin-products-header">
        <div className="admin-products-title-group">
          <h1 className="admin-products-title">Products Management</h1>
          <p className="admin-products-subtitle">Manage all products in your store</p>
        </div>
        <button
          type="button"
          className="admin-add-product-btn"
          onClick={() => navigate('/admin/products/add')}
        >
          <FiPlus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar Section (Search + Category Filter) */}
      {products.length > 0 && (
        <div className="admin-toolbar-row">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search products by name, brand or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="admin-filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table Section */}
      <div className="admin-table-container">
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
            No products available.
          </div>
        ) : (
          <table className="admin-products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '40px var(--spacing-lg)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const image = product.images && product.images.length > 0 ? product.images[0] : null;

                  // Derived Stock Status info
                  let status = 'In Stock';
                  let badgeClass = 'badge-stock-in';
                  let stockClass = '';

                  if (product.stock === 0) {
                    status = 'Out of Stock';
                    badgeClass = 'badge-stock-out';
                    stockClass = 'admin-product-stock-out';
                  } else if (product.stock <= LOW_STOCK_THRESHOLD) {
                    status = 'Low Stock';
                    badgeClass = 'badge-stock-low';
                    stockClass = 'admin-product-stock-low';
                  }

                  return (
                    <tr key={product._id}>
                      {/* Image Column */}
                      <td>
                        <div className="admin-product-img-container">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <FiImage size={20} />
                          )}
                        </div>
                      </td>

                      {/* Product Name */}
                      <td style={{ fontWeight: '500' }}>{product.name}</td>

                      {/* Category */}
                      <td>{product.category}</td>

                      {/* Price */}
                      <td style={{ fontWeight: '600' }}>₹{product.price}</td>

                      {/* Stock Count */}
                      <td className={stockClass}>{product.stock}</td>

                      {/* Stock Status Badge */}
                      <td>
                        <span className={`badge ${badgeClass}`}>{status}</span>
                      </td>

                      {/* Action Buttons */}
                      <td>
                        <div className="admin-table-actions">
                          <button
                            type="button"
                            className="admin-table-action-btn admin-table-action-btn--edit"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                            disabled={deletingId !== null}
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-table-action-btn admin-table-action-btn--delete"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={deletingId === product._id}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
