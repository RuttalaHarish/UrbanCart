import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import EmptyCart from '../components/cart/EmptyCart';
import './Cart.css';

function Cart() {
  const {
    cartItems,
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="container cart-page">
        <div className="cart-title-block">
          <h1 className="cart-title">Your Cart</h1>
        </div>
        <div className="cart-skeleton">
          <div className="cart-skeleton-left">
            <div className="cart-skeleton-item" />
            <div className="cart-skeleton-item" />
          </div>
          <div className="cart-skeleton-right" />
        </div>
      </div>
    );
  }

  /* ─── Empty cart ─── */
  if (cartItems.length === 0) {
    return (
      <div className="container cart-page">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="cart-title-block">
        <h1 className="cart-title">Your Cart</h1>
      </div>

      <div className="cart-layout-grid">
        {/* Left Side: Items */}
        <div className="cart-items-list">
          {cartItems.map((item) => (
            <CartItem
              key={item._id || item.product?._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Right Side: Summary Card */}
        <CartSummary items={cartItems} />
      </div>
    </div>
  );
}

export default Cart;

