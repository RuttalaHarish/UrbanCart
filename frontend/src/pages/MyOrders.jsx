import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiCalendar, FiArrowLeft, FiImage } from 'react-icons/fi';
import api from '../api/axios';
import { ORDER_ENDPOINTS } from '../constants';
import './MyOrders.css';

function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.LIST);
      // GET /api/orders returns { success: true, count: X, data: [ ... ] }
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Unable to retrieve your orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="container orders-page">
        <div className="orders-title-block">
          <h1 className="orders-title">My Orders</h1>
        </div>
        <div className="orders-skeleton-list">
          <div className="orders-skeleton-card" />
          <div className="orders-skeleton-card" />
          <div className="orders-skeleton-card" />
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div className="container orders-page">
        <div className="empty-orders-container">
          <h2 className="empty-orders-title">Something went wrong</h2>
          <p className="empty-orders-text">{error}</p>
          <button
            type="button"
            className="empty-orders-btn"
            onClick={fetchOrders}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Empty state ─── */
  if (orders.length === 0) {
    return (
      <div className="container orders-page">
        <div className="empty-orders-container">
          <svg
            className="empty-orders-illustration"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <h2 className="empty-orders-title">No orders found</h2>
          <p className="empty-orders-text">
            Looks like you haven't placed any orders yet. Let's explore our catalog!
          </p>
          <Link to="/" className="empty-orders-btn">
            <FiArrowLeft size={16} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <div className="orders-title-block">
        <h1 className="orders-title">My Orders ({orders.length})</h1>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <div
              key={order._id}
              className="order-card"
              onClick={() => navigate(`/orders/${order._id}`)}
              style={{ cursor: 'pointer' }}
            >
              {/* Order Card Header */}
              <div className="order-card-header">
                <div className="order-meta-info">
                  <div className="order-meta-item">
                    <span className="order-meta-label">Order ID</span>
                    <span className="order-meta-value">{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  </div>
                  <div className="order-meta-item">
                    <span className="order-meta-label">Order Date</span>
                    <span className="order-meta-value">
                      <FiCalendar size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {orderDate}
                    </span>
                  </div>
                  <div className="order-meta-item">
                    <span className="order-meta-label">Total Amount</span>
                    <span className="order-meta-value" style={{ fontWeight: 'bold' }}>
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="order-status-wrapper">
                  {/* Order Status Badge */}
                  <span className={`badge badge-order-${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                  {/* Payment Status Badge */}
                  <span className={`badge badge-payment-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus === 'Paid' ? 'Paid' : `Payment: ${order.paymentStatus}`}
                  </span>
                </div>
              </div>

              {/* Order Items List */}
              <div className="order-items-list">
                {order.items.map((item) => {
                  const product = item.product || {};
                  const name = product.name || 'Unknown Product';
                  const brand = product.brand || 'UrbanCart';
                  const image = product.images && product.images.length > 0 ? product.images[0] : null;

                  return (
                    <div key={item._id} className="order-item-row">
                      {/* Product Image */}
                      <div className="order-item-img-container">
                        {image ? (
                          <img src={image} alt={name} className="order-item-img" />
                        ) : (
                          <div className="order-item-placeholder">
                            <FiImage size={18} />
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="order-item-details">
                        <h4 className="order-item-name">{name}</h4>
                        <span className="order-item-brand">{brand}</span>
                      </div>

                      {/* Price and quantity breakdown */}
                      <div className="order-item-price-qty">
                        <span className="order-item-subtotal">
                          ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                        <span className="order-item-qty">
                          ${item.priceAtPurchase.toFixed(2)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyOrders;
