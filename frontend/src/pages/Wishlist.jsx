import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { WISHLIST_ENDPOINTS, CART_ENDPOINTS } from '../constants';
import WishlistItem from '../components/wishlist/WishlistItem';
import EmptyWishlist from '../components/wishlist/EmptyWishlist';
import './Wishlist.css';

function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movingId, setMovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(WISHLIST_ENDPOINTS.GET);
      // GET /api/wishlist returns { success: true, data: { products: [ ... ] } }
      if (response.data && response.data.data) {
        setProducts(response.data.data.products || []);
      } else {
        throw new Error('Invalid response structure received');
      }
    } catch (err) {
      console.error('Fetch wishlist failure:', err);
      setError('Unable to load wishlist. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await api.delete(WISHLIST_ENDPOINTS.REMOVE(productId));
      if (response.data && response.data.data) {
        setProducts(response.data.data.products || []);
        toast.success('Product removed from wishlist');
      }
    } catch (err) {
      console.error('Remove from wishlist failure:', err);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleMoveToCart = async (productId) => {
    setMovingId(productId);
    try {
      // 1. Add item to cart
      await api.post(CART_ENDPOINTS.ADD, { productId, quantity: 1 });
      
      // 2. Remove item from wishlist
      const response = await api.delete(WISHLIST_ENDPOINTS.REMOVE(productId));
      
      // 3. Update local state & notify user
      if (response.data && response.data.data) {
        setProducts(response.data.data.products || []);
      }
      toast.success('Product moved to cart successfully!');
    } catch (err) {
      console.error('Move to cart failure:', err);
      toast.error('Failed to move item to cart.');
    } finally {
      setMovingId(null);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="container wishlist-page">
        <div className="wishlist-title-block">
          <h1 className="wishlist-title">My Wishlist</h1>
        </div>
        <div className="wishlist-skeleton-list">
          <div className="wishlist-skeleton-item" />
          <div className="wishlist-skeleton-item" />
          <div className="wishlist-skeleton-item" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container wishlist-page">
        <div className="product-details-message-box">
          <FiAlertTriangle className="product-details-message-icon" style={{ color: 'var(--color-error)' }} />
          <h3 className="product-details-message-title">Unable to load wishlist</h3>
          <p className="product-details-message-text">{error}</p>
          <button className="product-details-retry-btn" onClick={fetchWishlist}>
            <FiRefreshCw style={{ marginRight: '6px' }} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container wishlist-page">
        <EmptyWishlist />
      </div>
    );
  }

  return (
    <div className="container wishlist-page">
      <div className="wishlist-title-block">
        <h1 className="wishlist-title">My Wishlist ({products.length})</h1>
      </div>

      <div className="wishlist-items-list">
        {products.map((item) => (
          <WishlistItem
            key={item._id}
            item={item}
            onMoveToCart={handleMoveToCart}
            onRemove={handleRemoveItem}
            isMoving={movingId === item._id}
          />
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
