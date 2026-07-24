import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import WishlistItem from '../components/wishlist/WishlistItem';
import EmptyWishlist from '../components/wishlist/EmptyWishlist';
import './Wishlist.css';

function Wishlist() {
  const { wishlistItems: products, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState(null);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Remove from wishlist failure:', err);
    }
  };

  const handleMoveToCart = async (productId) => {
    setMovingId(productId);
    try {
      // 1. Add item to cart
      await addToCart(productId, 1);
      
      // 2. Remove item from wishlist (updates context state immediately)
      await removeFromWishlist(productId);

      toast.success('Product moved to cart successfully!');
    } catch (err) {
      console.error('Move to cart failure:', err);
    } finally {
      setMovingId(null);
    }
  };

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
