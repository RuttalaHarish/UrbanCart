import { useState, useEffect } from 'react';
import { FiX, FiUser, FiMapPin, FiCreditCard, FiPackage, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_STATUSES, ORDER_ENDPOINTS } from '../constants';
import { formatCurrency } from '../utils/formatCurrency';
import './OrderDetailsModal.css';

function OrderDetailsModal({ order, onClose, onStatusUpdate }) {
  const [currentStatus, setCurrentStatus] = useState(order?.orderStatus || 'Pending');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order?.orderStatus) {
      setCurrentStatus(order.orderStatus);
    }
  }, [order]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!order) return null;

  const shortOrderId = order._id
    ? order._id.substring(order._id.length - 8).toUpperCase()
    : 'N/A';

  const customerName =
    order.user?.name || order.shippingAddress?.fullName || 'Guest Customer';
  const customerEmail = order.user?.email || 'N/A';
  const customerPhone = order.shippingAddress?.phone || 'N/A';

  const address = order.shippingAddress || {};

  const handleUpdateStatus = async () => {
    if (!order?._id || updating || currentStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      const response = await api.put(ORDER_ENDPOINTS.UPDATE_STATUS(order._id), {
        orderStatus: currentStatus,
      });
      if (response.data && response.data.success) {
        toast.success('Order status updated successfully');
        if (onStatusUpdate) {
          onStatusUpdate(order._id, currentStatus);
        }
      } else {
        toast.error('Failed to update order status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const createdDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const updatedDateFormatted = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : createdDateFormatted;

  return (
    <div
      className="order-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-heading"
    >
      <div className="order-modal-container">
        {/* Modal Header */}
        <div className="order-modal-header">
          <div className="order-modal-header-title">
            <h2 id="order-modal-heading" className="order-modal-heading">
              Order #{shortOrderId}
            </h2>
            <span className={`badge badge-order-${(order.orderStatus || 'pending').toLowerCase()}`}>
              {order.orderStatus}
            </span>
            <span className={`badge badge-payment-${(order.paymentStatus || 'pending').toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          </div>
          <button
            type="button"
            className="order-modal-close-btn"
            onClick={onClose}
            aria-label="Close order details modal"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="order-modal-body">
          {/* Customer & Shipping Grid */}
          <div className="order-modal-grid">
            {/* Customer Details Card */}
            <div className="order-modal-card">
              <h3 className="order-modal-card-title">
                <FiUser size={16} /> Customer Information
              </h3>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Name:</span>
                <span className="order-modal-val">{customerName}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Email:</span>
                <span className="order-modal-val">{customerEmail}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Phone:</span>
                <span className="order-modal-val">{customerPhone}</span>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="order-modal-card">
              <h3 className="order-modal-card-title">
                <FiMapPin size={16} /> Shipping Address
              </h3>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Street:</span>
                <span className="order-modal-val">{address.address || 'N/A'}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">City/State:</span>
                <span className="order-modal-val">
                  {address.city ? `${address.city}, ${address.state || ''}` : 'N/A'}
                </span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Pincode:</span>
                <span className="order-modal-val">{address.postalCode || 'N/A'}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Country:</span>
                <span className="order-modal-val">{address.country || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Products Purchased Table */}
          <div className="order-modal-items-section">
            <h3 className="order-modal-card-title" style={{ margin: 0 }}>
              <FiPackage size={16} /> Products Purchased ({order.items?.length || 0})
            </h3>
            <table className="order-modal-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(order.items) && order.items.length > 0 ? (
                  order.items.map((item, idx) => {
                    const price = item.priceAtPurchase || item.price || item.product?.price || 0;
                    const qty = item.quantity || 1;
                    const subtotal = price * qty;
                    const name = item.name || item.product?.name || 'Product';
                    const img = item.image || item.product?.image || '/placeholder.png';

                    return (
                      <tr key={item._id || idx}>
                        <td>
                          <div className="order-modal-product-cell">
                            <img
                              src={img}
                              alt={name}
                              className="order-modal-product-img"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/44?text=Product';
                              }}
                            />
                            <span className="order-modal-product-name">{name}</span>
                          </div>
                        </td>
                        <td>{qty}</td>
                        <td>{formatCurrency(price)}</td>
                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(subtotal)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No items in this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment & Timestamps Grid */}
          <div className="order-modal-grid">
            {/* Payment Details */}
            <div className="order-modal-card">
              <h3 className="order-modal-card-title">
                <FiCreditCard size={16} /> Payment Information
              </h3>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Payment Method:</span>
                <span className="order-modal-val">{order.paymentMethod || 'COD'}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Payment Status:</span>
                <span className="order-modal-val">
                  <span className={`badge badge-payment-${(order.paymentStatus || 'pending').toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </span>
              </div>
              <div className="order-modal-info-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <span className="order-modal-label" style={{ fontWeight: 'bold' }}>Total Amount:</span>
                <span className="order-modal-val" style={{ fontSize: '16px', color: 'var(--color-primary)' }}>
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="order-modal-card">
              <h3 className="order-modal-card-title">
                <FiCalendar size={16} /> Order Timeline
              </h3>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Created Date:</span>
                <span className="order-modal-val">{createdDateFormatted}</span>
              </div>
              <div className="order-modal-info-row">
                <span className="order-modal-label">Updated Date:</span>
                <span className="order-modal-val">{updatedDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="order-modal-footer">
          <div className="order-modal-status-form">
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              Update Order Status:
            </span>
            <select
              className="order-modal-select"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              disabled={updating}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="order-modal-btn-update"
              onClick={handleUpdateStatus}
              disabled={updating || currentStatus === order.orderStatus}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          <button
            type="button"
            className="order-modal-btn-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
