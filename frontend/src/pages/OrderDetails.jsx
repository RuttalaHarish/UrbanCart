import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiAlertTriangle, FiImage, FiCalendar, FiUser, FiPhone, FiXCircle } from 'react-icons/fi';
import api from '../api/axios';
import { ORDER_ENDPOINTS } from '../constants';
import { formatCurrency } from '../utils/formatCurrency';
import './OrderDetails.css';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.DETAILS(id));
      // GET /api/orders/:id returns { success: true, data: { ... } }
      if (response.data && response.data.data) {
        setOrder(response.data.data);
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      console.error('Fetch order detail error:', err);
      if (err.response && err.response.status === 404) {
        setError('404');
      } else {
        setError(err.response?.data?.message || 'Unable to load order details. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const response = await api.put(ORDER_ENDPOINTS.CANCEL(id));
      if (response.data?.success && response.data?.data) {
        setOrder(response.data.data);
        toast.success(response.data.message || 'Order cancelled successfully');
        setShowCancelModal(false);
      } else {
        toast.error(response.data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  /* ─── Loading Skeleton ─── */
  if (loading) {
    return (
      <div className="container order-details-page">
        <div className="details-skeleton-header" />
        <div className="details-skeleton-body">
          <div className="details-skeleton-card" />
          <div className="details-skeleton-card" />
        </div>
      </div>
    );
  }

  /* ─── Order Not Found (404) ─── */
  if (error === '404') {
    return (
      <div className="container order-details-page">
        <div className="not-found-container">
          <FiAlertTriangle className="not-found-icon" />
          <h2 className="not-found-title">Order Not Found</h2>
          <p className="not-found-text">
            The order you are looking for does not exist, or you do not have permission to view it.
          </p>
          <Link to="/my-orders" className="empty-orders-btn">
            <FiArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Generic Error State ─── */
  if (error) {
    return (
      <div className="container order-details-page">
        <div className="not-found-container">
          <FiAlertTriangle className="not-found-icon" style={{ color: 'var(--color-error)' }} />
          <h2 className="not-found-title">Unable to retrieve order</h2>
          <p className="not-found-text">{error}</p>
          <button type="button" className="empty-orders-btn" onClick={fetchOrderDetails}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const { shippingAddress = {} } = order;

  // Format Order Date
  const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container order-details-page">
      {/* Back button */}
      <Link to="/my-orders" className="order-details-back-btn">
        <FiArrowLeft size={14} /> Back to My Orders
      </Link>

      {/* Header section */}
      <div className="order-details-header">
        <div className="order-details-title-group">
          <h1 className="order-details-title">Order Details</h1>
          <span className="order-details-subtitle">
            Order ID: <strong>{order._id.toUpperCase()}</strong>
          </span>
        </div>

        <div className="order-status-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          {/* Order Status Badge */}
          <span className={`badge badge-order-${order.orderStatus.toLowerCase()}`} style={{ fontSize: '1rem', padding: 'var(--spacing-xs) var(--spacing-md)' }}>
            {order.orderStatus}
          </span>
          {/* Payment Status Badge */}
          <span className={`badge badge-payment-${order.paymentStatus.toLowerCase()}`} style={{ fontSize: '1rem', padding: 'var(--spacing-xs) var(--spacing-md)' }}>
            Payment: {order.paymentStatus}
          </span>

          {/* Cancel Order Action Button (Visible ONLY when orderStatus is Pending) */}
          {order.orderStatus === 'Pending' && (
            <button
              type="button"
              className="admin-action-btn admin-action-btn--danger"
              style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowCancelModal(true)}
            >
              <FiXCircle size={16} /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="order-details-grid">
        {/* Left Side: Product List */}
        <div className="order-details-left">
          <div className="order-details-card">
            <h2 className="order-details-card-title">
              <FiPackage size={18} /> Ordered Items
            </h2>

            <div className="order-details-items">
              {order.items.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Unknown Product';
                const brand = product.brand || 'UrbanCart';
                const image = product.images && product.images.length > 0 ? product.images[0] : null;

                return (
                  <div key={item._id} className="order-details-item-row">
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

                    {/* Product Details */}
                    <div className="order-item-details">
                      <h4 className="order-item-name">{name}</h4>
                      <span className="order-item-brand">{brand}</span>
                    </div>

                    {/* Pricing breakdown */}
                    <div className="order-item-price-qty">
                      <span className="order-item-subtotal">
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                      </span>
                      <span className="order-item-qty">
                        {formatCurrency(item.priceAtPurchase)} × {item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial summary calculations */}
            <div className="order-financials">
              <div className="financial-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="financial-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="financial-row financial-row--total">
                <span>Total Amount</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Shipping and Payment Information */}
        <div className="order-details-right">
          {/* Customer & Shipping Panel */}
          <div className="order-details-card">
            <h2 className="order-details-card-title">
              <FiMapPin size={18} /> Delivery Details
            </h2>
            <div className="info-summary-list">
              <div className="info-summary-item">
                <span className="info-summary-label">Recipient</span>
                <span className="info-summary-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiUser size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  {shippingAddress.fullName}
                </span>
              </div>

              <div className="info-summary-item">
                <span className="info-summary-label">Phone Number</span>
                <span className="info-summary-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiPhone size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  {shippingAddress.phone}
                </span>
              </div>

              <div className="info-summary-item">
                <span className="info-summary-label">Shipping Address</span>
                <span className="info-summary-value address-block">
                  {shippingAddress.address}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                  {shippingAddress.country}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details Panel */}
          <div className="order-details-card">
            <h2 className="order-details-card-title">
              <FiCreditCard size={18} /> Payment Info
            </h2>
            <div className="info-summary-list">
              <div className="info-summary-item">
                <span className="info-summary-label">Payment Method</span>
                <span className="info-summary-value">
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Payment Status</span>
                <span className="info-summary-value" style={{ fontWeight: '600' }}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="info-summary-item">
                <span className="info-summary-label">Order Placed</span>
                <span className="info-summary-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCalendar size={14} style={{ color: 'var(--color-text-secondary)' }} />
                  {orderDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3 className="admin-modal-title">Cancel Order</h3>
            <p className="admin-modal-message">
              Are you sure you want to cancel this order?
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-btn admin-modal-btn--cancel"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                No, Keep Order
              </button>
              <button
                type="button"
                className="admin-modal-btn admin-modal-btn--delete"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
