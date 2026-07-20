import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiCreditCard, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_ENDPOINTS, SHIPPING_THRESHOLD, SHIPPING_FEE } from '../constants';
import { useCart } from '../context/CartContext';
import './Checkout.css';



function Checkout() {
  const navigate = useNavigate();

  /* ─── Page states ─── */
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [phoneError, setPhoneError] = useState('');

  /* ─── Cart state from context ─── */
  const { cartItems, loading, clearCart } = useCart();

  /* ─── Redirect to cart if empty ─── */
  useEffect(() => {
    if (!loading && cartItems.length === 0 && !placed) {
      navigate('/cart');
    }
  }, [loading, cartItems, navigate, placed]);
  /* ─── Form state ─── */
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });


  /* ─── Derived totals from real cart items ─── */
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price ?? 0;
    const qty = item.quantity ?? 1;
    return acc + price * qty;
  }, 0);
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName' || name === 'city' || name === 'state') {
      // Accept only letters and spaces
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
    }
    if (name === 'phone') {
      // Accept only digits and max length 10
      if (!/^\d*$/.test(value) || value.length > 10) {
        return;
      }
      if (value.length !== 10) {
        setPhoneError('Phone number must contain exactly 10 digits.');
      } else {
        setPhoneError('');
      }
    }
    if (name === 'zip') {
      // Accept only digits
      if (!/^\d*$/.test(value)) {
        return;
      }
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    for (const field of required) {
      if (!form[field].trim()) {
        toast.error('Please fill in all required fields.');
        return false;
      }
    }

    if (form.fullName.trim().length < 2) {
      toast.error('Full Name must be at least 2 characters.');
      return false;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (form.phone.trim().length !== 10) {
      setPhoneError('Phone number must contain exactly 10 digits.');
      toast.error('Phone number must contain exactly 10 digits.');
      return false;
    }

    if (form.zip.trim().length < 5) {
      toast.error('Please enter a valid ZIP Code (minimum 5 digits).');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    if (paymentMethod === 'RAZORPAY') {
      toast.info('Online payment integration coming soon.');
      return;
    }

    setPlacing(true);
    try {
      await api.post(ORDER_ENDPOINTS.CREATE, {
        shippingAddress: {
          fullName: form.fullName,
          phone:    form.phone,
          address:  form.address,
          city:     form.city,
          state:    form.state,
          postalCode: form.zip,
          country:  'US',
        },
        paymentMethod,
      });

      // Success — clear shared cart state and update Navbar badge
      clearCart();
      setPlaced(true);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  /* ─── Loading State ─── */
  if (loading) {
    return (
      <div className="container checkout-page">
        <div className="checkout-header">
          <span className="checkout-badge">Secure Checkout</span>
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">Loading your order…</p>
        </div>
        <div className="checkout-grid">
          <div className="checkout-left">
            <div className="checkout-card" style={{ minHeight: '320px' }} />
          </div>
          <div className="checkout-right">
            <div className="checkout-card" style={{ minHeight: '220px' }} />
          </div>
        </div>
      </div>
    );
  }


  /* ─── Success State ─── */
  if (placed) {
    return (
      <div className="container checkout-page">
        <div className="checkout-success">
          <div className="checkout-success-icon">
            <FiCheckCircle size={64} />
          </div>
          <h2 className="checkout-success-title">Order Placed!</h2>
          <p className="checkout-success-sub">
            Thank you, <strong>{form.fullName || 'Customer'}</strong>. Your order is confirmed and
            will be delivered to <strong>{form.city}</strong> shortly.
          </p>
          <div className="checkout-success-actions">
            <Link to="/" className="checkout-success-btn checkout-success-btn--primary">
              Back to Home
            </Link>
            <Link to="/shop" className="checkout-success-btn checkout-success-btn--secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">

      {/* ── Breadcrumb ── */}
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="checkout-breadcrumb__link">
          <FiHome size={13} /> Home
        </Link>
        <span className="checkout-breadcrumb__sep">/</span>
        <Link to="/cart" className="checkout-breadcrumb__link">
          <FiShoppingCart size={13} /> Cart
        </Link>
        <span className="checkout-breadcrumb__sep">/</span>
        <span className="checkout-breadcrumb__current">
          <FiCreditCard size={13} /> Checkout
        </span>
      </nav>

      {/* ── Page Title ── */}
      <div className="checkout-header">
        <span className="checkout-badge">Secure Checkout</span>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Complete your order by filling in your shipping details.</p>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="checkout-grid">

        {/* ════ LEFT — Shipping Information ════ */}
        <div className="checkout-left">
          <div className="checkout-card">
            <h2 className="checkout-card-title">
              <FiPackage size={18} /> Shipping Information
            </h2>

            <div className="checkout-form">
              {/* Row 1 — Full Name + Email */}
              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label htmlFor="fullName" className="checkout-label">Full Name <span>*</span></label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="checkout-input"
                    value={form.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="email" className="checkout-label">Email Address <span>*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="checkout-input"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Row 2 — Phone */}
              <div className="checkout-field">
                <label htmlFor="phone" className="checkout-label">Phone Number <span>*</span></label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={`checkout-input ${phoneError ? 'checkout-input--error' : ''}`}
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                {phoneError && (
                  <span className="checkout-field-error" style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    {phoneError}
                  </span>
                )}
              </div>

              {/* Row 3 — Address */}
              <div className="checkout-field">
                <label htmlFor="address" className="checkout-label">Street Address <span>*</span></label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="checkout-input"
                  value={form.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                />
              </div>

              {/* Row 4 — City / State / ZIP */}
              <div className="checkout-form-row checkout-form-row--three">
                <div className="checkout-field">
                  <label htmlFor="city" className="checkout-label">City <span>*</span></label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="checkout-input"
                    value={form.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="state" className="checkout-label">State <span>*</span></label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className="checkout-input"
                    value={form.state}
                    onChange={handleChange}
                    autoComplete="address-level1"
                  />
                </div>
                <div className="checkout-field">
                  <label htmlFor="zip" className="checkout-label">ZIP Code <span>*</span></label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    className="checkout-input"
                    value={form.zip}
                    onChange={handleChange}
                    autoComplete="postal-code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT — Order Summary ════ */}
        <div className="checkout-right">
          <div className="checkout-card">
            <h2 className="checkout-card-title">
              <FiShoppingCart size={18} /> Order Summary
            </h2>

            {/* Product List — real cart items */}
            <ul className="checkout-order-list">
              {cartItems.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Product';
                const brand = product.brand || product.category || '';
                const qty = item.quantity ?? 1;
                const price = product.price ?? 0;
                return (
                  <li key={item._id} className="checkout-order-item">
                    <div className="checkout-order-item-info">
                      <span className="checkout-order-item-name">{name}</span>
                      {brand && <span className="checkout-order-item-brand">{brand}</span>}
                    </div>
                    <div className="checkout-order-item-right">
                      <span className="checkout-order-item-qty">× {qty}</span>
                      <span className="checkout-order-item-price">${(price * qty).toFixed(2)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="checkout-summary-divider" />

            {/* Totals */}
            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-totals-row">
                <span>Shipping</span>
                {shippingFee === 0
                  ? <span className="checkout-totals-free">Free</span>
                  : <span>${shippingFee.toFixed(2)}</span>}
              </div>
              {shippingFee > 0 && (
                <div className="checkout-totals-hint">
                  Free shipping on orders over ${SHIPPING_THRESHOLD}
                </div>
              )}
              <div className="checkout-summary-divider" />
              <div className="checkout-totals-row checkout-totals-row--grand">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="checkout-payment-method-section" style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
              <h3 className="checkout-payment-title" style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Payment Method
              </h3>
              <div className="checkout-payment-options" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="checkout-payment-option" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer', fontSize: 'var(--font-size-small)' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label className="checkout-payment-option" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', cursor: 'pointer', fontSize: 'var(--font-size-small)' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Online Payment</span>
                </label>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              id="place-order-btn"
              type="button"
              className="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <>
                  <span className="checkout-spinner" />
                  Placing Order…
                </>
              ) : (
                <>
                  <FiCreditCard size={16} />
                  Place Order
                </>
              )}
            </button>

            <p className="checkout-secure-note">
              🔒 Your information is protected with 256-bit SSL encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
