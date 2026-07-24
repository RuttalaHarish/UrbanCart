import { useNavigate } from 'react-router-dom';
import { SHIPPING_THRESHOLD, SHIPPING_FEE } from '../../constants';
import { formatCurrency } from '../../utils/formatCurrency';
import './CartSummary.css';

function CartSummary({ items = [] }) {
  const navigate = useNavigate();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="cart-summary-card">
      <h3 className="cart-summary-title">Order Summary</h3>

      <div className="cart-summary-rows">
        {/* Total Items */}
        <div className="cart-summary-row">
          <span>Items ({totalItems})</span>
          <span className="cart-summary-row-bold">{formatCurrency(subtotal)}</span>
        </div>

        {/* Shipping details */}
        <div className="cart-summary-row">
          <span>Shipping</span>
          {shippingFee === 0 ? (
            <span className="cart-summary-row-free">Free</span>
          ) : (
            <span className="cart-summary-row-bold">{formatCurrency(shippingFee)}</span>
          )}
        </div>

        {shippingFee > 0 && (
          <div className="cart-summary-row" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
            <span>Free shipping on orders over {formatCurrency(SHIPPING_THRESHOLD)}</span>
          </div>
        )}

        <hr className="cart-summary-divider" />

        {/* Grand Total */}
        <div className="cart-summary-row cart-summary-row-total">
          <span>Total</span>
          <span className="cart-summary-row-total-val">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        className="cart-summary-checkout-btn"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

export default CartSummary;
