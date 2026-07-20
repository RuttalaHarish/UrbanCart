import { useState, useEffect } from 'react';
import { FiShoppingBag, FiClock, FiCheckCircle, FiDollarSign, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import { ORDER_ENDPOINTS } from '../constants';
import { Loading, ErrorState } from '../components/common';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ORDER_ENDPOINTS.DASHBOARD_STATS);
      // GET /api/orders/dashboard/stats returns { success: true, stats: { totalOrders, pendingOrders, deliveredOrders, revenue } }
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      } else {
        throw new Error('Invalid statistics response');
      }
    } catch (err) {
      console.error('Fetch dashboard stats failure:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <Loading message="Loading dashboard stats..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardStats} />;
  }

  if (!stats) return null;

  return (
    <div className="container admin-dashboard-page">
      {/* Title Header */}
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Dashboard</h1>
        <p className="admin-dashboard-welcome">Welcome Admin</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="admin-dashboard-grid">
        {/* Card 1: Total Orders */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon-box admin-stats-icon-box--blue">
            <FiShoppingBag size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Total Orders</span>
            <span className="admin-stats-value">{stats.totalOrders}</span>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon-box admin-stats-icon-box--amber">
            <FiClock size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Pending Orders</span>
            <span className="admin-stats-value">{stats.pendingOrders}</span>
          </div>
        </div>

        {/* Card 3: Delivered Orders */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon-box admin-stats-icon-box--green">
            <FiCheckCircle size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Delivered Orders</span>
            <span className="admin-stats-value">{stats.deliveredOrders}</span>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="admin-stats-card">
          <div className="admin-stats-icon-box admin-stats-icon-box--purple">
            <FiDollarSign size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Revenue</span>
            <span className="admin-stats-value">₹{stats.revenue.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
