import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_ENDPOINTS } from '../constants';
import { Loading, ErrorState } from '../components/common';
import '../styles/AdminOrders.css';

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.ALL);
      // GET /api/orders/all returns { success: true, count: X, data: [ ... ] }
      if (response.data && response.data.data) {
        setOrders(response.data.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // derived in-memory filtered orders list (chains Search + Order Status + Payment Status)
  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    
    // 1. Search filter
    const matchesSearch = !q || (
      (order._id && order._id.toLowerCase().includes(q)) ||
      (order.user?.name && order.user.name.toLowerCase().includes(q)) ||
      (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(q))
    );

    // 2. Order Status filter
    const matchesOrderStatus =
      !statusFilter ||
      statusFilter === 'All' ||
      order.orderStatus === statusFilter;

    // 3. Payment Status filter
    const matchesPaymentStatus =
      !paymentFilter ||
      paymentFilter === 'All' ||
      order.paymentStatus === paymentFilter;

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
  });

  if (loading) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchOrders} />;
  }

  return (
    <div className="container admin-orders-page">
      {/* Page Header */}
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">Orders Management</h1>
      </div>

      {/* Toolbar Section (Search + Status Filters) */}
      {orders.length > 0 && (
        <div className="admin-orders-toolbar">
          <input
            type="text"
            className="admin-orders-search-input"
            placeholder="Search orders by customer or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="admin-orders-filter-group">
            <select
              className="admin-orders-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Order Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="admin-orders-select"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="All">All Payment Status</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="admin-table-container">
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
            No orders available.
          </div>
        ) : (
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Order Status</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '40px var(--spacing-lg)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const customerName = order.user?.name || order.shippingAddress?.fullName || 'Unknown Customer';
                  const itemsCount = (order.orderItems || order.items || []).length;

                  return (
                    <tr key={order._id}>
                      {/* Order ID */}
                      <td>
                        <span className="order-id-txt">{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="customer-info">
                          <span className="customer-name">{customerName}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td>{itemsCount}</td>

                      {/* Total */}
                      <td style={{ fontWeight: 'bold' }}>₹{order.totalAmount}</td>

                      {/* Order Status */}
                      <td>
                        <span className={`badge badge-order-${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={`badge badge-payment-${order.paymentStatus.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          <FiEye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
