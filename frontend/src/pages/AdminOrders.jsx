import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiTrash2, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_ENDPOINTS } from '../constants';
import { Loading, ErrorState } from '../components/common';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { formatCurrency } from '../utils/formatCurrency';
import { exportOrdersToCsv } from '../utils/exportCsv';
import '../styles/AdminOrders.css';

const ITEMS_PER_PAGE = 10;

function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Modal states
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.ALL);
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

  // Sync status filter from URL parameter
  useEffect(() => {
    if (statusParam && ORDER_STATUSES.includes(statusParam)) {
      setStatusFilter(statusParam);
    } else if (!statusParam) {
      setStatusFilter('All');
    }
  }, [statusParam]);

  // Reset pagination to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter]);

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    if (newStatus && newStatus !== 'All') {
      setSearchParams({ status: newStatus });
    } else {
      setSearchParams({});
    }
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete || deleting) return;
    setDeleting(true);
    try {
      const response = await api.delete(ORDER_ENDPOINTS.DELETE(orderToDelete._id));
      if (response.status === 200 || response.data?.success) {
        toast.success(response.data?.message || 'Order deleted successfully');
        setOrders((prevOrders) => prevOrders.filter((o) => o._id !== orderToDelete._id));
        setOrderToDelete(null);
      } else {
        toast.error(response.data?.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Delete order error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const handleOrderModalStatusUpdate = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
    if (selectedOrderForModal && selectedOrderForModal._id === orderId) {
      setSelectedOrderForModal((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
    }
  };

  // 1. Filtered orders list (chains Search + Order Status + Payment Status)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        (order._id && order._id.toLowerCase().includes(q)) ||
        (order.user?.name && order.user.name.toLowerCase().includes(q)) ||
        (order.shippingAddress?.fullName &&
          order.shippingAddress.fullName.toLowerCase().includes(q));

      const matchesOrderStatus =
        !statusFilter ||
        statusFilter === 'All' ||
        order.orderStatus === statusFilter;

      const matchesPaymentStatus =
        !paymentFilter ||
        paymentFilter === 'All' ||
        order.paymentStatus === paymentFilter;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  // 2. CSV Export Handler
  const handleExportCsv = () => {
    if (filteredOrders.length === 0 || exporting) return;
    setExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `orders-${dateStr}.csv`;
      const success = exportOrdersToCsv(filteredOrders, filename);
      if (success) {
        toast.success(`Exported ${filteredOrders.length} orders to CSV`);
      } else {
        toast.error('No orders available to export.');
      }
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to generate CSV file');
    } finally {
      setExporting(false);
    }
  };

  // 3. Pagination Calculations
  const totalOrdersCount = filteredOrders.length;
  const totalPages = Math.ceil(totalOrdersCount / ITEMS_PER_PAGE) || 1;

  // Auto-adjust page if current page exceeds total pages (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // 4. Paginated slice of current page items
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const startItem = totalOrdersCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalOrdersCount);

  if (loading) {
    return <Loading message="Loading orders..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchOrders} />;
  }

  const headingTitle =
    statusFilter && statusFilter !== 'All'
      ? `${statusFilter} Orders`
      : 'All Orders';

  return (
    <div className="container admin-orders-page">
      {/* Header Section */}
      <div className="admin-orders-header">
        <h1 className="admin-orders-title">{headingTitle}</h1>
      </div>

      {/* Toolbar Controls */}
      <div className="admin-orders-toolbar">
        {/* Search input */}
        <input
          type="text"
          className="admin-orders-search-input"
          placeholder="Search by ID, name, or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Filter dropdowns & Export CSV Action */}
        <div className="admin-orders-filter-group">
          {/* Order Status Select */}
          <select
            className="admin-orders-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="All">All Order Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Payment Status Select */}
          <select
            className="admin-orders-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="All">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            className="admin-action-btn"
            style={{ padding: '10px 16px', height: '100%' }}
            onClick={handleExportCsv}
            disabled={exporting || filteredOrders.length === 0}
            title={filteredOrders.length === 0 ? 'No orders available to export.' : 'Export visible orders to CSV'}
          >
            <FiDownload size={15} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="admin-table-container">
        {paginatedOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              {statusFilter && statusFilter !== 'All'
                ? `No ${statusFilter.toLowerCase()} orders found.`
                : 'No orders found.'}
            </p>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const customerName =
                  order.user?.name || order.shippingAddress?.fullName || 'Guest';
                const itemsCount = Array.isArray(order.items)
                  ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
                  : 0;

                return (
                  <tr key={order._id}>
                    {/* Order ID */}
                    <td>
                      <span className="order-id-txt">
                        {order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
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
                    <td style={{ fontWeight: 'bold' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>

                    {/* Order Status */}
                    <td>
                      <span
                        className={`badge badge-order-${order.orderStatus.toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    {/* Payment Status */}
                    <td>
                      <span
                        className={`badge badge-payment-${order.paymentStatus.toLowerCase()}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => setSelectedOrderForModal(order)}
                          aria-label={`View details for order ${order._id}`}
                        >
                          <FiEye size={14} /> View
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn--danger"
                          onClick={() => setOrderToDelete(order)}
                          aria-label={`Delete order ${order._id}`}
                        >
                          <FiTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {totalOrdersCount > 0 && (
        <div className="admin-pagination-bar">
          <div className="admin-pagination-info">
            Showing {startItem}–{endItem} of {totalOrdersCount} Orders
          </div>

          <div className="admin-pagination-controls">
            <button
              type="button"
              className="admin-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous Page"
            >
              <FiChevronLeft size={16} /> Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`admin-pagination-page ${
                  pageNum === currentPage ? 'admin-pagination-page--active' : ''
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              className="admin-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next Page"
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* View Order Details Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onStatusUpdate={handleOrderModalStatusUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3 className="admin-modal-title">Delete Order</h3>
            <p className="admin-modal-message">
              Are you sure you want to permanently delete this order?
            </p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-btn admin-modal-btn--cancel"
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-btn admin-modal-btn--delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
