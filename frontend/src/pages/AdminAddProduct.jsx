import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiInfo, FiDollarSign, FiArchive, FiTag, FiImage, FiArrowLeft, FiPlus, FiTrash2, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { CATEGORY_ENDPOINTS, PRODUCT_ENDPOINTS } from '../constants';
import './AdminAddProduct.css';

function AdminAddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [images, setImages] = useState(['']); // At least one URL input initially
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Categories loading state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // Edit-mode Product Details loading state
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState(null);

  // Fetch Categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.LIST);
      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        throw new Error('Invalid categories structure');
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
      setErrorCategories('Failed to load categories.');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch Product details if editing
  const fetchProductDetails = async () => {
    setLoadingProduct(true);
    setErrorProduct(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.DETAILS(id));
      if (response.data && response.data.data) {
        const p = response.data.data;
        setFormData({
          name: p.name || '',
          brand: p.brand || '',
          description: p.description || '',
          price: p.price !== undefined ? String(p.price) : '',
          stock: p.stock !== undefined ? String(p.stock) : '',
          category: p.category || '',
        });
        setImages(p.images && p.images.length > 0 ? p.images : ['']);
      } else {
        throw new Error('Product details not found');
      }
    } catch (err) {
      console.error('Fetch product details error:', err);
      setErrorProduct('Failed to load product details.');
    } finally {
      setLoadingProduct(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProductDetails();
    }
  }, [id]);

  // Validation function per field
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Product Name is required.';
        } else if (value.trim().length < 3) {
          error = 'Product Name must be at least 3 characters.';
        } else if (value.trim().length > 100) {
          error = 'Product Name cannot exceed 100 characters.';
        }
        break;
      case 'brand':
        if (!value.trim()) {
          error = 'Brand is required.';
        } else if (value.trim().length < 2) {
          error = 'Brand must be at least 2 characters.';
        } else if (value.trim().length > 50) {
          error = 'Brand cannot exceed 50 characters.';
        }
        break;
      case 'description':
        if (!value.trim()) {
          error = 'Description is required.';
        } else if (value.trim().length < 20) {
          error = 'Description must be at least 20 characters.';
        }
        break;
      case 'price':
        if (value === '' || value === undefined) {
          error = 'Price is required.';
        } else {
          const num = Number(value);
          if (isNaN(num)) {
            error = 'Price must be a valid number.';
          } else if (num < 0) {
            error = 'Price must be greater than or equal to 0.';
          }
        }
        break;
      case 'stock':
        if (value === '' || value === undefined) {
          error = 'Stock is required.';
        } else {
          const num = Number(value);
          if (isNaN(num) || !Number.isInteger(num)) {
            error = 'Stock must be a whole number.';
          } else if (num < 0) {
            error = 'Stock must be greater than or equal to 0.';
          }
        }
        break;
      case 'category':
        if (!value) {
          error = 'Category is required.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Image URLs validation
  const validateImages = (imgList) => {
    const filledUrls = imgList.filter((url) => url.trim() !== '');
    if (filledUrls.length === 0) {
      return 'At least one image URL is required.';
    }

    const urlRegex = /^https?:\/\/.+/i;
    for (let i = 0; i < imgList.length; i++) {
      const url = imgList[i].trim();
      if (url && !urlRegex.test(url)) {
        return `Image URL ${i + 1} is invalid. It must start with http:// or https://`;
      }
    }
    return '';
  };

  // Standard input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate on-the-fly to clear error message once valid
    const err = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: err,
    }));
  };

  // Multiple image URLs handlers
  const handleImageChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index] = value;
    setImages(updatedImages);

    // Validate images on-the-fly to clear errors
    const err = validateImages(updatedImages);
    setErrors((prev) => ({
      ...prev,
      images: err,
    }));
  };

  const addImageField = () => {
    setImages((prev) => [...prev, '']);
  };

  const removeImageField = (index) => {
    if (images.length > 1) {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);

      // Re-validate remaining images list
      const err = validateImages(updatedImages);
      setErrors((prev) => ({
        ...prev,
        images: err,
      }));
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent duplicate submissions

    // Trigger full form validation
    const formErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) formErrors[key] = err;
    });

    const imgErr = validateImages(images);
    if (imgErr) formErrors.images = imgErr;

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Do not submit if validation fails
    }

    setErrors({});
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        images: images.filter((url) => url.trim() !== ''),
      };

      if (isEditMode) {
        const response = await api.put(PRODUCT_ENDPOINTS.UPDATE(id), payload);
        if (response.data && response.data.success) {
          toast.success('Product updated successfully.');
          navigate('/admin/products');
        } else {
          throw new Error('Server returned unsuccessful update flag');
        }
      } else {
        const response = await api.post(PRODUCT_ENDPOINTS.CREATE, payload);
        if (response.data && response.data.success) {
          toast.success('Product created successfully.');
          setFormData({ name: '', brand: '', description: '', price: '', stock: '', category: '' });
          setImages(['']);
          navigate('/admin/products');
        } else {
          throw new Error('Server returned unsuccessful creation flag');
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(serverMsg || `Unable to ${isEditMode ? 'update' : 'create'} product.`);
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading Product State ─── */
  if (loadingProduct) {
    return (
      <div className="container admin-add-product-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h1 className="admin-add-product-title" style={{ marginBottom: '20px' }}>Edit Product</h1>
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading product details...</div>
      </div>
    );
  }

  /* ─── Error Product State ─── */
  if (errorProduct) {
    return (
      <div className="container admin-add-product-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <FiAlertTriangle size={48} style={{ color: 'var(--color-error)', marginBottom: '16px' }} />
        <h1 className="admin-add-product-title" style={{ marginBottom: '10px' }}>Edit Product</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{errorProduct}</p>
        <button
          type="button"
          onClick={fetchProductDetails}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
            padding: '8px 16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            background: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container admin-add-product-page">
      {/* Back button link */}
      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: 'var(--font-size-small)',
          padding: '0',
        }}
      >
        <FiArrowLeft size={14} /> Back to Products
      </button>

      {/* Header Block */}
      <div className="admin-add-product-header">
        <h1 className="admin-add-product-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
        <p className="admin-add-product-subtitle">
          {isEditMode ? 'Update your product information' : 'Create a new product for your store'}
        </p>
      </div>

      {/* Responsive Form Card */}
      <form onSubmit={handleSave} className="admin-add-product-card" noValidate>
        {/* Section 1: Product Information */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">
            <FiInfo size={18} /> Product Information
          </h2>
          
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              disabled={saving}
              className={`admin-form-input ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <span className="admin-error-text">{errors.name}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              disabled={saving}
              className={`admin-form-input ${errors.brand ? 'is-invalid' : ''}`}
              value={formData.brand}
              onChange={handleInputChange}
            />
            {errors.brand && <span className="admin-error-text">{errors.brand}</span>}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              disabled={saving}
              className={`admin-form-textarea ${errors.description ? 'is-invalid' : ''}`}
              value={formData.description}
              onChange={handleInputChange}
            />
            {errors.description && <span className="admin-error-text">{errors.description}</span>}
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="admin-form-section">
          <div className="admin-form-row-2col">
            {/* Pricing */}
            <div className="admin-form-group">
              <h2 className="admin-form-section-title" style={{ marginBottom: '12px' }}>
                <FiDollarSign size={18} /> Pricing
              </h2>
              <label className="admin-form-label" htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                disabled={saving}
                className={`admin-form-input ${errors.price ? 'is-invalid' : ''}`}
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
              {errors.price && <span className="admin-error-text">{errors.price}</span>}
            </div>

            {/* Inventory */}
            <div className="admin-form-group">
              <h2 className="admin-form-section-title" style={{ marginBottom: '12px' }}>
                <FiArchive size={18} /> Inventory
              </h2>
              <label className="admin-form-label" htmlFor="stock">Stock Quantity</label>
              <input
                type="number"
                id="stock"
                name="stock"
                disabled={saving}
                className={`admin-form-input ${errors.stock ? 'is-invalid' : ''}`}
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
              />
              {errors.stock && <span className="admin-error-text">{errors.stock}</span>}
            </div>
          </div>
        </div>

        {/* Section 3: Category Selection */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">
            <FiTag size={18} /> Category
          </h2>

          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="category">Select Category</label>
            {loadingCategories ? (
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
                Loading categories...
              </div>
            ) : errorCategories ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
                <FiAlertTriangle />
                <span>{errorCategories}</span>
                <button
                  type="button"
                  onClick={fetchCategories}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0',
                    fontSize: 'var(--font-size-small)',
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <select
                id="category"
                name="category"
                disabled={saving}
                className={`admin-form-select ${errors.category ? 'is-invalid' : ''}`}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {errors.category && <span className="admin-error-text">{errors.category}</span>}
          </div>
        </div>

        {/* Section 4: Image URLs */}
        <div className="admin-form-section">
          <h2 className="admin-form-section-title">
            <FiImage size={18} /> Images
          </h2>

          <div className="admin-image-inputs-container">
            <label className="admin-form-label">Product Image URLs</label>
            {images.map((url, index) => (
              <div key={index} className="admin-image-input-row">
                <input
                  type="url"
                  disabled={saving}
                  className={`admin-form-input ${errors.images ? 'is-invalid' : ''}`}
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    className="admin-remove-image-btn"
                    onClick={() => removeImageField(index)}
                    disabled={saving}
                    title="Remove image URL"
                  >
                    <FiTrash2 size={14} /> Remove
                  </button>
                )}
              </div>
            ))}
            {errors.images && <span className="admin-error-text">{errors.images}</span>}
            <button
              type="button"
              className="admin-add-image-btn"
              onClick={addImageField}
              disabled={saving}
            >
              <FiPlus size={14} /> Add Image URL
            </button>
          </div>
        </div>

        {/* Form Action buttons */}
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            {saving
              ? isEditMode
                ? 'Updating Product...'
                : 'Creating Product...'
              : isEditMode
              ? 'Update Product'
              : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminAddProduct;
