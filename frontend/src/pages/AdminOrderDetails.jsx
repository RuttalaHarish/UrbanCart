import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMapPin, FiCreditCard, FiPackage, FiInfo, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_ENDPOINTS } from '../constants';
import { Loading } from '../components/common';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/AdminOrderDetails.css';

function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.DETAILS(id));
      // GET /api/orders/:id returns { success: true, data: { ... } }
      if (response.data && response.data.data) {
        setOrder(response.data.data);
        setSelectedStatus(response.data.data.orderStatus || 'Pending');
        setSelectedPaymentStatus(response.data.data.paymentStatus || 'Pending');
      } else {
        throw new Error('Order not found');
      }
    } catch (err) {
      console.error('Fetch admin order detail error:', err);
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await api.put(ORDER_ENDPOINTS.UPDATE_STATUS(id), {
        status: selectedStatus,
        orderStatus: selectedStatus,
      });
      toast.success('Order status updated successfully.');
      fetchOrderDetails();
    } catch (err) {
      console.error('Update status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    setUpdatingPayment(true);
    try {
      await api.put(ORDER_ENDPOINTS.UPDATE_STATUS(id), {
        paymentStatus: selectedPaymentStatus,
      });
      toast.success('Payment status updated successfully.');
      fetchOrderDetails();
    } catch (err) {
      console.error('Update payment status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (loading) {
    return <Loading message="Loading order details..." />;
  }

  /* ─── Error State ─── */
  if (error) {
    return (
      <div className="container admin-order-details-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <FiAlertTriangle size={48} style={{ color: 'var(--color-error)', marginBottom: '16px' }} />
        <h2 className="admin-order-details-title" style={{ marginBottom: '10px' }}>Order Details</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>{error}</p>
        <button
          type="button"
          className="admin-back-btn"
          onClick={fetchOrderDetails}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
        >
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  if (!order) return null;

  const { shippingAddress = {} } = order;
  const customerName = order.user?.name || shippingAddress.fullName || 'Unknown Customer';
  const customerEmail = order.user?.email || 'N/A';
  const customerPhone = order.user?.phone || shippingAddress.phone || 'N/A';

  const orderItems = order.items || order.orderItems || [];

  return (
    <div className="container admin-order-details-page">
      {/* Back button */}
      <Link to="/admin/orders" className="admin-back-btn">
        <FiArrowLeft size={14} /> Back to Orders
      </Link>

      {/* Page Title */}
      <div className="admin-order-details-header">
        <h1 className="admin-order-details-title">Order Details</h1>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Order ID: <strong>{order._id.toUpperCase()}</strong>
        </span>
      </div>

      {/* Grid Layout */}
      <div className="admin-order-details-grid">
        {/* Left Column: Products List */}
        <div className="admin-order-details-left">
          <div className="admin-details-card">
            <h2 className="admin-details-card-title">
              <FiPackage size={18} /> Ordered Products
            </h2>
            <div className="admin-details-items">
              {orderItems.map((item) => {
                const product = item.product || {};
                const name = product.name || 'Unknown Product';
                const price = item.priceAtPurchase ?? product.price ?? 0;

                return (
                  <div key={item._id} className="admin-details-item-row">
                    <div className="admin-item-info">
                      <span className="admin-item-name">{name}</span>
                      <span className="admin-item-qty">Quantity: {item.quantity}</span>
                    </div>
                    <span className="admin-item-price">{formatCurrency(price * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Financial summary */}
            <div className="admin-details-financials">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer, Delivery, and Status Panels */}
        <div className="admin-order-details-right">
          {/* Customer Information Panel */}
          <div className="admin-details-card">
            <h2 className="admin-details-card-title">
              <FiUser size={18} /> Customer Info
            </h2>
            <div className="admin-info-list">
              <div className="admin-info-item">
                <span className="admin-info-label">Name</span>
                <span className="admin-info-value">{customerName}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Email</span>
                <span className="admin-info-value">{customerEmail}</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Phone</span>
                <span className="admin-info-value">{customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Panel */}
          <div className="admin-details-card">
            <h2 className="admin-details-card-title">
              <FiMapPin size={18} /> Shipping Address
            </h2>
            <div className="admin-info-list">
              <div className="admin-info-item">
                <span className="admin-info-label">Address</span>
                <span className="admin-info-value">
                  {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}, {shippingAddress.country}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Order Status Panel */}
          <div className="admin-details-card">
            <h2 className="admin-details-card-title">
              <FiInfo size={18} /> Status Details
            </h2>
            <div className="admin-status-wrapper">
              <div className="admin-info-item">
                <span className="admin-info-label">Order Status</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--font-size-small)',
                    width: '100%',
                    maxWidth: '200px',
                    marginTop: '4px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {ORDER_STATUSES.filter((s) => s !== 'Cancelled').map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  style={{ marginTop: '8px', width: 'fit-content' }}
                >
                  {updating ? 'Updating...' : 'Update Order Status'}
                </button>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Payment Status</span>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--font-size-small)',
                    width: '100%',
                    maxWidth: '200px',
                    marginTop: '4px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                 <button
                  type="button"
                  className="admin-action-btn"
                  onClick={handleUpdatePaymentStatus}
                  disabled={updatingPayment}
                  style={{ marginTop: '8px', width: 'fit-content' }}
                >
                  {updatingPayment ? 'Updating...' : 'Update Payment Status'}
                </button>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">Payment Method</span>
                <span className="admin-info-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiCreditCard size={14} /> {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetails;
