import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiShoppingBag, FiArrowLeft, FiShoppingCart, FiRefreshCw, FiHeart } from 'react-icons/fi';
import api from '../api/axios';
import { PRODUCT_ENDPOINTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/formatCurrency';
import ProductGallery from '../components/product/ProductGallery';
import QuantitySelector from '../components/product/QuantitySelector';
import RelatedProducts from '../components/product/RelatedProducts';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.DETAILS(id));
      // API returns { success: true, data: { ... } }
      if (response.data && response.data.data) {
        setProduct(response.data.data);
        setQuantity(1); // Reset quantity selector
      } else {
        throw new Error('Product not found in data wrapper');
      }
    } catch (err) {
      console.error('Fetch product detail failure:', err);
      if (err.response && err.response.status === 404) {
        setError('404');
      } else {
        setError('Unable to load product. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (redirectToCart = false) => {
    setIsAdding(true);
    try {
      await addToCart(product._id, quantity);
      toast.success(`${name} added to cart!`);
      if (redirectToCart) {
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const msg = err.response?.data?.message || 'Failed to add item to cart. Please try again.';
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    setIsAddingWishlist(true);
    try {
      if (isWishlisted(product._id)) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setIsAddingWishlist(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [id]);

  // Loading skeleton state
  if (loading) {
    return (
      <div className="container product-details-page">
        <div className="product-details-skeleton">
          <div className="product-details-skeleton-left" />
          <div className="product-details-skeleton-right">
            <div className="product-details-skeleton-line" style={{ width: '40%', height: '20px' }} />
            <div className="product-details-skeleton-line" style={{ width: '80%', height: '40px' }} />
            <div className="product-details-skeleton-line" style={{ width: '30%', height: '30px' }} />
            <div className="product-details-skeleton-line" style={{ width: '100%', height: '100px' }} />
            <div className="product-details-skeleton-line" style={{ width: '60%', height: '40px' }} />
          </div>
        </div>
      </div>
    );
  }

  // 404 Product Not Found state
  if (error === '404') {
    return (
      <div className="container product-details-page">
        <div className="product-details-message-box">
          <FiAlertTriangle className="product-details-message-icon" style={{ color: 'var(--color-warning)' }} />
          <h3 className="product-details-message-title">Product Not Found</h3>
          <p className="product-details-message-text">
            The product you are trying to view does not exist or has been removed.
          </p>
          <button className="product-details-retry-btn" onClick={() => navigate('/')}>
            <FiArrowLeft style={{ marginRight: '6px' }} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Error fetching state
  if (error) {
    return (
      <div className="container product-details-page">
        <div className="product-details-message-box">
          <FiAlertTriangle className="product-details-message-icon" style={{ color: 'var(--color-error)' }} />
          <h3 className="product-details-message-title">Unable to load product</h3>
          <p className="product-details-message-text">{error}</p>
          <button className="product-details-retry-btn" onClick={fetchProductDetails}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Product not parsed fallback
  if (!product) return null;

  const { name, brand, category, description, price, stock, images } = product;
  const isOutOfStock = stock <= 0;
  const inWishlist = isWishlisted(product._id);

  return (
    <div className="container product-details-page">
      {/* Back button */}
      <button
        className="product-details-btn product-details-btn-secondary"
        style={{ width: 'fit-content', marginBottom: 'var(--spacing-md)' }}
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft size={16} /> Back
      </button>

      {/* Main product view block */}
      <div className="product-details-container">
        {/* Left side: Images */}
        <div className="product-details-left">
          <ProductGallery images={images} productName={name} />
        </div>

        {/* Right side: Product info & Actions */}
        <div className="product-details-right">
          <div className="product-details-header">
            <span className="product-details-category">{category}</span>
            <span className="product-details-brand">{brand}</span>
          </div>

          <h1 className="product-details-title">{name}</h1>

          <div className="product-details-price-row">
            <span className="product-details-price">{formatCurrency(price)}</span>
            <span
              className={`product-details-stock-badge ${
                isOutOfStock ? 'badge-outofstock' : 'badge-instock'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>

          {/* Description */}
          <div className="product-details-description-section">
            <h4 className="product-details-description-title">Product Description</h4>
            <p className="product-details-description">{description}</p>
          </div>

          {/* Actions: Selector and buttons */}
          <div className="product-details-actions-wrapper">
            {!isOutOfStock && (
              <div className="product-details-qty-block">
                <span className="product-details-qty-label">Quantity:</span>
                <QuantitySelector
                  quantity={quantity}
                  stock={stock}
                  onChange={setQuantity}
                />
              </div>
            )}

            <div className="product-details-btns">
              <button
                className="product-details-btn product-details-btn-secondary"
                disabled={isOutOfStock || isAdding}
                onClick={() => handleAddToCart(false)}
                aria-label="Add product to cart"
              >
                <FiShoppingCart size={18} /> {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                className="product-details-btn product-details-btn-primary"
                disabled={isOutOfStock || isAdding}
                onClick={() => handleAddToCart(true)}
                aria-label="Buy product now"
              >
                <FiShoppingBag size={18} /> Buy Now
              </button>
              <button
                className={`product-details-btn product-details-btn-secondary ${inWishlist ? 'product-details-btn-wishlisted' : ''}`}
                disabled={isAddingWishlist}
                onClick={handleToggleWishlist}
                aria-label="Add product to wishlist"
              >
                <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} style={{ color: inWishlist ? 'var(--color-error, #ef4444)' : 'inherit' }} />
                {isAddingWishlist ? 'Updating...' : inWishlist ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products list */}
      <RelatedProducts currentProductId={product._id} category={category} />
    </div>
  );
}

export default ProductDetails;
