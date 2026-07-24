import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiShoppingCart, FiCreditCard, FiCheckCircle, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_ENDPOINTS, SHIPPING_THRESHOLD, SHIPPING_FEE, PAYMENT_ENDPOINTS } from '../constants';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadRazorpayScript } from '../utils/loadRazorpayScript';
import { formatCurrency } from '../utils/formatCurrency';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();

  /* ─── Page states ─── */
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [phoneError, setPhoneError] = useState('');

  /* ─── Auth state to prefill user info ─── */
  const { user } = useAuth();

  /* ─── Cart state & refresh method from context ─── */
  const { cartItems, loading, fetchCart, clearCart } = useCart();

  /* ─── Redirect to cart if empty ─── */
  useEffect(() => {
    if (!loading && cartItems.length === 0 && !placed) {
      navigate('/cart');
    }
  }, [loading, cartItems, navigate, placed]);

  /* ─── Form state ─── */
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
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
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        toast.error('Failed to load Razorpay SDK.');
        return;
      }

      setPlacing(true);
      try {
        // Step 1: Create Pending MongoDB order
        const orderResponse = await api.post(ORDER_ENDPOINTS.CREATE, {
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.zip,
            country: 'US',
          },
          paymentMethod: 'RAZORPAY',
        });

        const createdOrder = orderResponse.data.data;
        const dbOrderId = createdOrder._id;

        // Step 2: Initialize Razorpay Order ID with backend
        const paymentResponse = await api.post(PAYMENT_ENDPOINTS.CREATE_ORDER, {
          orderId: dbOrderId,
          amount: createdOrder.totalAmount || grandTotal,
        });

        const rzpData = paymentResponse.data.data;

        // Step 3: Configure and open Razorpay modal
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: 'UrbanCart',
          description: `Order #${dbOrderId}`,
          order_id: rzpData.id,
          prefill: {
            name: form.fullName || user?.name || '',
            email: form.email || user?.email || '',
            contact: form.phone || user?.phone || '',
          },
          theme: {
            color: '#2563eb',
          },
          handler: async function (response) {
            try {
              // Step 4: Verify HMAC signature & set paymentStatus = Paid
              await api.post(PAYMENT_ENDPOINTS.VERIFY, {
                orderId: dbOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Step 5: Clear local cart & show order success UI
              clearCart();
              setPlaced(true);
              toast.success('Payment verified & order placed successfully! 🎉');
            } catch (error) {
              console.error('Payment Verification Failed:', error);
              toast.error(error.response?.data?.message || 'Payment verification failed.');
            } finally {
              setPlacing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
              toast.info('Payment cancelled. Your order remains pending in My Orders.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error('Payment Failed:', response.error);
          setPlacing(false);
          toast.error('Payment failed. Please try again.');
        });
        rzp.open();
      } catch (err) {
        setPlacing(false);
        if (err.response?.status === 409 || err.response?.data?.cartUpdated) {
          await fetchCart();
          toast.warn(
            'Some unavailable products were removed from your cart. Please review your cart before placing the order.'
          );
          return;
        }
        console.error('Error in Razorpay checkout flow:', err);
        toast.error(err.response?.data?.message || 'Failed to initialize payment.');
      }
      return;
    }

    setPlacing(true);
    try {
      await api.post(ORDER_ENDPOINTS.CREATE, {
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.zip,
          country: 'US',
        },
        paymentMethod,
      });

      // Success — clear shared cart state and update Navbar badge
      clearCart();
      setPlaced(true);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.cartUpdated) {
        await fetchCart();
        toast.warn(
          'Some unavailable products were removed from your cart. Please review your cart before placing the order.'
        );
        return;
      }
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
            Thank you for shopping with UrbanCart. Your order has been placed and is being processed.
          </p>
          <div className="checkout-success-actions">
            <Link to="/my-orders" className="checkout-success-btn checkout-success-btn--primary">
              <FiPackage size={16} style={{ marginRight: '6px' }} /> View My Orders
            </Link>
            <Link to="/" className="checkout-success-btn checkout-success-btn--secondary">
              <FiHome size={16} style={{ marginRight: '6px' }} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      {/* Breadcrumb */}
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="checkout-breadcrumb__link">
          <FiHome size={14} /> Home
        </Link>
        <span className="checkout-breadcrumb__sep">/</span>
        <Link to="/cart" className="checkout-breadcrumb__link">
          <FiShoppingCart size={14} /> Cart
        </Link>
        <span className="checkout-breadcrumb__sep">/</span>
        <span className="checkout-breadcrumb__current">Checkout</span>
      </nav>

      {/* Page Header */}
      <div className="checkout-header">
        <span className="checkout-badge">Secure Checkout</span>
        <h1 className="checkout-title">Checkout</h1>
        <p className="checkout-subtitle">Fill in your shipping details to complete the order.</p>
      </div>

      <div className="checkout-grid">
        {/* Left Column: Forms */}
        <div className="checkout-left">
          {/* Shipping Address Card */}
          <div className="checkout-card">
            <h2 className="checkout-card-title">
              <FiHome size={18} /> Shipping Address
            </h2>

            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <div className="checkout-field">
                <label className="checkout-label">
                  Full Name <span>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="checkout-input"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-row">
                <div className="checkout-field">
                  <label className="checkout-label">
                    Email Address <span>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="checkout-input"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">
                    Phone Number <span>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="checkout-input"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {phoneError && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>
                      {phoneError}
                    </span>
                  )}
                </div>
              </div>

              <div className="checkout-field">
                <label className="checkout-label">
                  Street Address <span>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="checkout-input"
                  placeholder="123 Main Street, Apt 4B"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-row checkout-form-row--three">
                <div className="checkout-field">
                  <label className="checkout-label">
                    City <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="checkout-input"
                    placeholder="New York"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">
                    State <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    className="checkout-input"
                    placeholder="NY"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkout-field">
                  <label className="checkout-label">
                    ZIP Code <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    className="checkout-input"
                    placeholder="10001"
                    value={form.zip}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Card */}
          <div className="checkout-card" style={{ marginTop: '1.5rem' }}>
            <h2 className="checkout-card-title">
              <FiCreditCard size={18} /> Payment Method
            </h2>

            <div className="checkout-form" style={{ gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: paymentMethod === 'COD' ? '2px solid #2563eb' : '1px solid #dbe4ee',
                  backgroundColor: paymentMethod === 'COD' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Pay in cash upon delivery
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: paymentMethod === 'RAZORPAY' ? '2px solid #2563eb' : '1px solid #dbe4ee',
                  backgroundColor: paymentMethod === 'RAZORPAY' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                    Online Payment (Razorpay)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Pay securely using Cards, UPI, NetBanking, or Wallets
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-right">
          <div className="checkout-card" style={{ position: 'sticky', top: '2rem' }}>
            <h2 className="checkout-card-title">
              <FiShoppingCart size={18} /> Order Summary
            </h2>

            {/* Order Items List */}
            <ul className="checkout-order-list">
              {cartItems.map((item) => (
                <li key={item._id || item.product?._id} className="checkout-order-item">
                  <div className="checkout-order-item-info">
                    <span className="checkout-order-item-name">{item.product?.name || 'Product'}</span>
                    {item.product?.brand && (
                      <span className="checkout-order-item-brand">{item.product.brand}</span>
                    )}
                  </div>
                  <div className="checkout-order-item-right">
                    <span className="checkout-order-item-qty">x{item.quantity}</span>
                    <span className="checkout-order-item-price">
                      {formatCurrency((item.product?.price ?? 0) * (item.quantity ?? 1))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="checkout-summary-divider" />

            {/* Totals */}
            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="checkout-totals-row">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="checkout-totals-free">FREE</span>
                ) : (
                  <span>{formatCurrency(shippingFee)}</span>
                )}
              </div>

              {shippingFee > 0 && (
                <div className="checkout-totals-hint">
                  Free shipping on orders over {formatCurrency(SHIPPING_THRESHOLD)}
                </div>
              )}

              <div className="checkout-summary-divider" />

              <div className="checkout-totals-row checkout-totals-row--grand">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="button"
              className="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <>
                  <span className="checkout-spinner" /> Processing Order…
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <p className="checkout-secure-note">
              🔒 Encrypted 256-bit SSL Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
