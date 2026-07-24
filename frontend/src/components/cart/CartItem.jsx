import { FiImage, FiTrash2 } from 'react-icons/fi';
import QuantitySelector from '../product/QuantitySelector';
import { formatCurrency } from '../../utils/formatCurrency';
import './CartItem.css';

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item;

  // Fallback in case population failed or product deleted
  if (!product) return null;

  const { name, brand, price, stock, images } = product;
  const subtotal = price * quantity;

  return (
    <div className="cart-item-row">
      {/* Product Image */}
      <div className="cart-item-img-container">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={name} className="cart-item-img" />
        ) : (
          <div className="cart-item-placeholder">
            <FiImage />
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="cart-item-details">
        <h3 className="cart-item-name">{name}</h3>
        <span className="cart-item-brand">{brand}</span>
      </div>

      {/* Single Price */}
      <div className="cart-item-price">{formatCurrency(price)}</div>

      {/* Quantity Adjuster */}
      <div>
        <QuantitySelector
          quantity={quantity}
          stock={stock}
          onChange={(newQty) => onUpdateQuantity(product._id, newQty)}
        />
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">{formatCurrency(subtotal)}</div>

      {/* Remove Button */}
      <button
        type="button"
        className="cart-item-remove-btn"
        onClick={() => onRemove(product._id)}
        aria-label={`Remove ${name} from cart`}
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}

export default CartItem;
