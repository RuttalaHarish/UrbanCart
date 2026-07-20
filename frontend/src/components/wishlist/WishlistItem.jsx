import { FiImage, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import './WishlistItem.css';

function WishlistItem({ item, onMoveToCart, onRemove, isMoving }) {
  // Fallback in case population failed or product deleted
  if (!item) return null;

  const { name, brand, category, price, stock, images } = item;
  const isOutOfStock = stock <= 0;

  return (
    <div className="wishlist-item-row">
      {/* Product Image */}
      <div className="wishlist-item-img-container">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={name} className="wishlist-item-img" />
        ) : (
          <div className="wishlist-item-placeholder">
            <FiImage />
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="wishlist-item-details">
        <h3 className="wishlist-item-name">{name}</h3>
        <span className="wishlist-item-category-brand">
          {category} | {brand}
        </span>
      </div>

      {/* Single Price */}
      <div className="wishlist-item-price">${price.toFixed(2)}</div>

      {/* Stock status badge */}
      <div>
        <span
          className={`wishlist-item-badge ${
            isOutOfStock ? 'wishlist-item-badge-outofstock' : 'wishlist-item-badge-instock'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>
      </div>

      {/* Move to Cart button */}
      <div className="wishlist-item-actions">
        <button
          type="button"
          className="wishlist-item-btn wishlist-item-btn-primary"
          onClick={() => onMoveToCart(item._id)}
          disabled={isOutOfStock || isMoving}
          aria-label={`Move ${name} to cart`}
        >
          <FiShoppingCart size={14} /> Move to Cart
        </button>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="wishlist-item-remove-btn"
        onClick={() => onRemove(item._id)}
        aria-label={`Remove ${name} from wishlist`}
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}

export default WishlistItem;
