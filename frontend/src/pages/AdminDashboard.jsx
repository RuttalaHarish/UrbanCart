import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiEye,
  FiRefreshCw,
  FiPlus,
  FiCalendar,
  FiPlusCircle,
  FiPackage,
  FiTag,
  FiAlertTriangle,
  FiXCircle,
  FiEdit,
  FiPieChart,
  FiTruck,
  FiBarChart2,
  FiActivity,
  FiInbox,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../api/axios';
import {
  ORDER_ENDPOINTS,
  PRODUCT_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  LOW_STOCK_THRESHOLD,
} from '../constants';
import { useAuth } from '../context/AuthContext';
import { ErrorState } from '../components/common';
import { formatCurrency } from '../utils/formatCurrency';
import '../styles/AdminDashboard.css';
import '../styles/AdminOrders.css';

const STATUS_COLORS = {
  Pending: '#d97706',
  Processing: '#2563eb',
  Shipped: '#4f46e5',
  Delivered: '#059669',
  Cancelled: '#ef4444',
};

function formatRelativeTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CountUpValue({ value, formatter }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 650; // ms
    const frameTime = 16;
    const totalFrames = Math.round(duration / frameTime);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const current = Math.round(target * (1 - (1 - progress) * (1 - progress)));
      setDisplayValue(current);

      if (frame >= totalFrames) {
        setDisplayValue(target);
        clearInterval(timer);
      }
    }, frameTime);

    return () => clearInterval(timer);
  }, [value]);

  return <>{formatter ? formatter(displayValue) : displayValue}</>;
}

function AdminDashboardSkeleton() {
  return (
    <div className="container admin-dashboard-page" aria-busy="true" aria-label="Loading dashboard">
      {/* Header Skeleton */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header-left">
          <div className="admin-skeleton admin-skeleton-title" style={{ width: 180 }} />
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 240 }} />
        </div>
        <div className="admin-dashboard-header-right">
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 120, height: 36 }} />
          <div className="admin-skeleton admin-skeleton-text" style={{ width: 100, height: 36 }} />
        </div>
      </div>

      {/* KPI Skeleton Grid */}
      <div className="admin-dashboard-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-skeleton-card">
            <div className="admin-skeleton admin-skeleton-icon" />
            <div style={{ flex: 1 }}>
              <div className="admin-skeleton admin-skeleton-text" style={{ width: '50%' }} />
              <div className="admin-skeleton admin-skeleton-title" style={{ width: '80%', margin: 0 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="admin-quick-actions-section">
        <div className="admin-skeleton admin-skeleton-title" style={{ width: 160, marginBottom: 16 }} />
        <div className="admin-quick-actions-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-skeleton-card" style={{ height: 100 }} />
          ))}
        </div>
      </div>

      {/* Inventory Summary Skeleton */}
      <div style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div className="admin-skeleton admin-skeleton-title" style={{ width: 180, marginBottom: 16 }} />
        <div className="admin-dashboard-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-skeleton-card" />
          ))}
        </div>
      </div>

      {/* Chart Skeletons */}
      <div style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div className="admin-skeleton admin-skeleton-title" style={{ width: 200, marginBottom: 16 }} />
        <div className="admin-skeleton admin-skeleton-chart" />
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const salesAnalyticsRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7days');

  const scrollToSalesAnalytics = () => {
    if (salesAnalyticsRef.current) {
      salesAnalyticsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
        api.get(ORDER_ENDPOINTS.DASHBOARD_STATS),
        api.get(ORDER_ENDPOINTS.ALL),
        api.get(PRODUCT_ENDPOINTS.LIST),
        api.get(CATEGORY_ENDPOINTS.LIST),
      ]);

      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      } else {
        throw new Error('Invalid statistics response');
      }

      if (ordersRes.data && Array.isArray(ordersRes.data.data)) {
        setAllOrders(ordersRes.data.data);
      } else {
        setAllOrders([]);
      }

      const productsList = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.data || productsRes.data?.products || [];
      setAllProducts(productsList);

      const categoriesList = Array.isArray(categoriesRes.data)
        ? categoriesRes.data
        : categoriesRes.data?.data || categoriesRes.data?.categories || [];
      setAllCategories(categoriesList);
    } catch (err) {
      console.error('Fetch dashboard data failure:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Performance Optimization: Derived state calculations via useMemo
  const recentOrders = useMemo(() => {
    return [...allOrders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [allOrders]);

  // Date Range Filtered Orders
  const dateFilteredOrders = useMemo(() => {
    const now = new Date();
    return allOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      if (dateRange === '7days') {
        const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= cutoff;
      }
      if (dateRange === '30days') {
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= cutoff;
      }
      if (dateRange === '90days') {
        const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return orderDate >= cutoff;
      }
      if (dateRange === 'thisMonth') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (dateRange === 'thisYear') {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [allOrders, dateRange]);

  const { orderStatusSummary, orderStatusChartData } = useMemo(() => {
    const pending = dateFilteredOrders.filter((o) => o.orderStatus === 'Pending').length;
    const processing = dateFilteredOrders.filter((o) => o.orderStatus === 'Processing').length;
    const shipped = dateFilteredOrders.filter((o) => o.orderStatus === 'Shipped').length;
    const delivered = dateFilteredOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const cancelled = dateFilteredOrders.filter((o) => o.orderStatus === 'Cancelled').length;

    const summary = { pending, processing, shipped, delivered, cancelled };
    const pieData = [
      { name: 'Pending', value: pending, color: STATUS_COLORS.Pending },
      { name: 'Processing', value: processing, color: STATUS_COLORS.Processing },
      { name: 'Shipped', value: shipped, color: STATUS_COLORS.Shipped },
      { name: 'Delivered', value: delivered, color: STATUS_COLORS.Delivered },
      { name: 'Cancelled', value: cancelled, color: STATUS_COLORS.Cancelled },
    ].filter((item) => item.value > 0);

    return { orderStatusSummary: summary, orderStatusChartData: pieData };
  }, [dateFilteredOrders]);

  const salesAnalytics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todaySum = 0;
    let weeklySum = 0;
    let monthlySum = 0;
    let rangeRevSum = 0;

    allOrders.forEach((o) => {
      const amt = Number(o.totalAmount || 0);
      const oDate = new Date(o.createdAt);
      if (oDate >= startOfToday) todaySum += amt;
      if (oDate >= sevenDaysAgo) weeklySum += amt;
      if (oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear()) {
        monthlySum += amt;
      }
    });

    dateFilteredOrders.forEach((o) => {
      rangeRevSum += Number(o.totalAmount || 0);
    });

    const calculatedAov = dateFilteredOrders.length > 0 ? rangeRevSum / dateFilteredOrders.length : 0;

    return {
      todaySales: todaySum,
      weeklySales: weeklySum,
      monthlySales: monthlySum,
      rangeRevenue: rangeRevSum,
      aov: calculatedAov,
      rangeOrderCount: dateFilteredOrders.length,
    };
  }, [allOrders, dateFilteredOrders]);

  // Single synchronized calculation for both Dashboard KPI Revenue & Sales Analytics Monthly Sales
  const monthlyRevenue = useMemo(() => {
    return salesAnalytics.rangeRevenue > 0
      ? salesAnalytics.rangeRevenue
      : Number(stats?.totalRevenue || stats?.revenue || 0);
  }, [salesAnalytics.rangeRevenue, stats?.totalRevenue, stats?.revenue]);

  const revenueTrendData = useMemo(() => {
    const trendList = [];
    const now = new Date();

    if (dateRange === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayNameShort = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNameFull = d.toLocaleDateString('en-US', { weekday: 'long' });

        const dayRevenue = allOrders.reduce((sum, o) => {
          const oDate = new Date(o.createdAt);
          if (
            oDate.getFullYear() === d.getFullYear() &&
            oDate.getMonth() === d.getMonth() &&
            oDate.getDate() === d.getDate()
          ) {
            return sum + Number(o.totalAmount || 0);
          }
          return sum;
        }, 0);

        trendList.push({ day: dayNameShort, fullDay: dayNameFull, revenue: dayRevenue });
      }
    } else if (dateRange === '30days') {
      for (let i = 5; i >= 0; i--) {
        const startD = new Date(now.getTime() - (i * 5 + 4) * 24 * 60 * 60 * 1000);
        const endD = new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000);
        const label = `${startD.getDate()}/${startD.getMonth() + 1} - ${endD.getDate()}/${endD.getMonth() + 1}`;

        const intervalRevenue = dateFilteredOrders.reduce((sum, o) => {
          const oDate = new Date(o.createdAt);
          if (oDate >= startD && oDate <= endD) {
            return sum + Number(o.totalAmount || 0);
          }
          return sum;
        }, 0);

        trendList.push({ day: label, fullDay: label, revenue: intervalRevenue });
      }
    } else if (dateRange === '90days') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        const fullMonthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const monthRevenue = dateFilteredOrders.reduce((sum, o) => {
          const oDate = new Date(o.createdAt);
          if (oDate.getMonth() === d.getMonth() && oDate.getFullYear() === d.getFullYear()) {
            return sum + Number(o.totalAmount || 0);
          }
          return sum;
        }, 0);

        trendList.push({ day: monthName, fullDay: fullMonthName, revenue: monthRevenue });
      }
    } else if (dateRange === 'thisMonth') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const weeksCount = Math.ceil(daysInMonth / 7);
      for (let w = 1; w <= weeksCount; w++) {
        const startDay = (w - 1) * 7 + 1;
        const endDay = Math.min(w * 7, daysInMonth);
        const label = `Week ${w} (${startDay}-${endDay})`;

        const weekRevenue = dateFilteredOrders.reduce((sum, o) => {
          const oDate = new Date(o.createdAt);
          if (
            oDate.getFullYear() === now.getFullYear() &&
            oDate.getMonth() === now.getMonth() &&
            oDate.getDate() >= startDay &&
            oDate.getDate() <= endDay
          ) {
            return sum + Number(o.totalAmount || 0);
          }
          return sum;
        }, 0);

        trendList.push({ day: `W${w}`, fullDay: label, revenue: weekRevenue });
      }
    } else if (dateRange === 'thisYear') {
      for (let m = 0; m < 12; m++) {
        const d = new Date(now.getFullYear(), m, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        const fullMonthName = d.toLocaleDateString('en-US', { month: 'long' });

        const monthRevenue = dateFilteredOrders.reduce((sum, o) => {
          const oDate = new Date(o.createdAt);
          if (oDate.getFullYear() === now.getFullYear() && oDate.getMonth() === m) {
            return sum + Number(o.totalAmount || 0);
          }
          return sum;
        }, 0);

        trendList.push({ day: monthName, fullDay: fullMonthName, revenue: monthRevenue });
      }
    }

    return trendList;
  }, [allOrders, dateFilteredOrders, dateRange]);

  const { lowStockProducts, inventorySummary } = useMemo(() => {
    const threshold = LOW_STOCK_THRESHOLD || 10;
    const lowStockList = allProducts.filter((p) => Number(p.stock) <= threshold);
    const lowStockCount = lowStockList.length;
    const outOfStockCount = allProducts.filter((p) => Number(p.stock) === 0).length;

    return {
      lowStockProducts: lowStockList,
      inventorySummary: {
        totalProducts: allProducts.length,
        totalCategories: allCategories.length,
        lowStockCount,
        outOfStockCount,
      },
    };
  }, [allProducts, allCategories]);

  const activityTimeline = useMemo(() => {
    const activities = [];
    const threshold = LOW_STOCK_THRESHOLD || 10;

    allOrders.forEach((o) => {
      const customerName = o.user?.name || o.shippingAddress?.fullName || 'Customer';
      const orderIdShort = o._id.substring(o._id.length - 8).toUpperCase();
      const timestamp = new Date(o.createdAt || Date.now());

      activities.push({
        id: `order-create-${o._id}`,
        timestamp,
        formattedTime: formatRelativeTime(timestamp),
        icon: <FiShoppingBag size={16} />,
        colorClass: 'admin-stats-icon-box--blue',
        title: 'New Order Placed',
        description: `Order #${orderIdShort} placed by ${customerName}`,
      });

      if (o.orderStatus === 'Shipped') {
        activities.push({
          id: `order-shipped-${o._id}`,
          timestamp,
          formattedTime: formatRelativeTime(timestamp),
          icon: <FiTruck size={16} />,
          colorClass: 'admin-stats-icon-box--indigo',
          title: 'Order Shipped',
          description: `Order #${orderIdShort} was shipped`,
        });
      }

      if (o.orderStatus === 'Delivered') {
        activities.push({
          id: `order-delivered-${o._id}`,
          timestamp,
          formattedTime: formatRelativeTime(timestamp),
          icon: <FiCheckCircle size={16} />,
          colorClass: 'admin-stats-icon-box--green',
          title: 'Order Delivered',
          description: `Order #${orderIdShort} was delivered`,
        });
      }
    });

    allProducts.forEach((p) => {
      const pTimestamp = new Date(p.createdAt || Date.now());

      activities.push({
        id: `product-add-${p._id}`,
        timestamp: pTimestamp,
        formattedTime: formatRelativeTime(pTimestamp),
        icon: <FiPlusCircle size={16} />,
        colorClass: 'admin-stats-icon-box--purple',
        title: 'Product Added',
        description: `New product "${p.name}" added to catalog`,
      });

      if (Number(p.stock) <= threshold) {
        activities.push({
          id: `low-stock-${p._id}`,
          timestamp: pTimestamp,
          formattedTime: formatRelativeTime(pTimestamp),
          icon: <FiAlertTriangle size={16} />,
          colorClass: 'admin-stats-icon-box--amber',
          title: 'Low Stock Alert',
          description: `"${p.name}" is running low on stock (${p.stock} remaining)`,
        });
      }
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [allOrders, allProducts]);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchDashboardData(false)} />;
  }

  if (!stats) return null;

  return (
    <div className="container admin-dashboard-page">
      {/* Header Section */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-header-left">
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-welcome">
            Welcome back, {user?.name || 'Admin'} 👋
          </p>
        </div>

        <div className="admin-dashboard-header-right">
          <div className="admin-dashboard-date" aria-label={`Today is ${todayDate}`}>
            <FiCalendar size={15} />
            <span>{todayDate}</span>
          </div>

          <div className="admin-dashboard-actions">
            <button
              type="button"
              className="admin-action-btn"
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              aria-label="Refresh dashboard metrics"
            >
              <FiRefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              className="admin-action-btn admin-action-btn--primary"
              onClick={() => navigate('/admin/products/add')}
              aria-label="Add new product"
            >
              <FiPlus size={14} /> Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid with Count-Up Animations */}
      <div className="admin-dashboard-grid">
        {/* Card 1: Total Orders */}
        <div
          className="admin-stats-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/orders')}
          role="button"
          tabIndex={0}
          aria-label="View total orders list"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders')}
        >
          <div className="admin-stats-icon-box admin-stats-icon-box--blue">
            <FiShoppingBag size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Total Orders</span>
            <span className="admin-stats-value">
              <CountUpValue value={stats.totalOrders} />
            </span>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div
          className="admin-stats-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/orders?status=Pending')}
          role="button"
          tabIndex={0}
          aria-label="View pending orders"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Pending')}
        >
          <div className="admin-stats-icon-box admin-stats-icon-box--amber">
            <FiClock size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Pending Orders</span>
            <span className="admin-stats-value">
              <CountUpValue value={stats.pendingOrders} />
            </span>
          </div>
        </div>

        {/* Card 3: Delivered Orders */}
        <div
          className="admin-stats-card"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/orders?status=Delivered')}
          role="button"
          tabIndex={0}
          aria-label="View delivered orders"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Delivered')}
        >
          <div className="admin-stats-icon-box admin-stats-icon-box--green">
            <FiCheckCircle size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Delivered Orders</span>
            <span className="admin-stats-value">
              <CountUpValue value={stats.deliveredOrders} />
            </span>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div
          className="admin-stats-card"
          style={{ cursor: 'pointer' }}
          onClick={scrollToSalesAnalytics}
          role="button"
          tabIndex={0}
          aria-label="Scroll to sales analytics"
          onKeyDown={(e) => e.key === 'Enter' && scrollToSalesAnalytics()}
        >
          <div className="admin-stats-icon-box admin-stats-icon-box--purple">
            <FiTrendingUp size={24} />
          </div>
          <div className="admin-stats-info">
            <span className="admin-stats-label">Revenue</span>
            <span className="admin-stats-value">
              <CountUpValue value={monthlyRevenue} formatter={formatCurrency} />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="admin-quick-actions-section">
        <h2 className="admin-quick-actions-title">Quick Actions</h2>
        <div className="admin-quick-actions-grid">
          <div
            className="admin-quick-action-card"
            onClick={() => navigate('/admin/products/add')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to add product page"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products/add')}
          >
            <div className="admin-quick-action-header">
              <div className="admin-quick-action-icon">
                <FiPlusCircle size={20} />
              </div>
              <h3 className="admin-quick-action-title">Add Product</h3>
            </div>
            <p className="admin-quick-action-desc">Create a new product.</p>
          </div>

          <div
            className="admin-quick-action-card"
            onClick={() => navigate('/admin/products')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to manage products page"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products')}
          >
            <div className="admin-quick-action-header">
              <div className="admin-quick-action-icon">
                <FiPackage size={20} />
              </div>
              <h3 className="admin-quick-action-title">Manage Products</h3>
            </div>
            <p className="admin-quick-action-desc">View and edit products.</p>
          </div>

          <div
            className="admin-quick-action-card"
            onClick={() => navigate('/admin/orders')}
            role="button"
            tabIndex={0}
            aria-label="Navigate to manage orders page"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders')}
          >
            <div className="admin-quick-action-header">
              <div className="admin-quick-action-icon">
                <FiShoppingBag size={20} />
              </div>
              <h3 className="admin-quick-action-title">Manage Orders</h3>
            </div>
            <p className="admin-quick-action-desc">Manage customer orders.</p>
          </div>

          <div
            className="admin-quick-action-card"
            onClick={() => fetchDashboardData(true)}
            role="button"
            tabIndex={0}
            aria-label="Refresh dashboard data"
            onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData(true)}
          >
            <div className="admin-quick-action-header">
              <div className="admin-quick-action-icon">
                <FiRefreshCw size={20} className={refreshing ? 'spin-icon' : ''} />
              </div>
              <h3 className="admin-quick-action-title">
                {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
              </h3>
            </div>
            <p className="admin-quick-action-desc">Reload dashboard statistics.</p>
          </div>
        </div>
      </div>

      {/* Inventory Summary Section */}
      <div className="admin-inventory-summary-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <h2 className="admin-quick-actions-title">Inventory Summary</h2>
        <div className="admin-dashboard-grid">
          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/products')}
            role="button"
            tabIndex={0}
            aria-label="View all products"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--blue">
              <FiPackage size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Products</span>
              <span className="admin-stats-value">
                <CountUpValue value={inventorySummary.totalProducts} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/products?view=categories')}
            role="button"
            tabIndex={0}
            aria-label="View all categories"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products?view=categories')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--purple">
              <FiTag size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Categories</span>
              <span className="admin-stats-value">
                <CountUpValue value={inventorySummary.totalCategories} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/products?stock=low')}
            role="button"
            tabIndex={0}
            aria-label="View low stock products"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products?stock=low')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--amber">
              <FiAlertTriangle size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Low Stock</span>
              <span className="admin-stats-value">
                <CountUpValue value={inventorySummary.lowStockCount} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/products?stock=out')}
            role="button"
            tabIndex={0}
            aria-label="View out of stock products"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/products?stock=out')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--red">
              <FiXCircle size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Out of Stock</span>
              <span className="admin-stats-value">
                <CountUpValue value={inventorySummary.outOfStockCount} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="admin-low-stock-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-recent-orders-title" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle style={{ color: '#d97706' }} /> Low Stock Alerts
          </h2>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => navigate('/admin/products')}
            aria-label="Manage all products inventory"
          >
            Manage All Products
          </button>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="admin-card-container admin-empty-state-box">
            <FiCheckCircle size={44} style={{ color: '#059669' }} />
            <h3 className="admin-empty-state-title">No Low Stock Alerts</h3>
            <p className="admin-empty-state-desc">All products have healthy inventory levels.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product._id}>
                    <td style={{ fontWeight: '500' }}>{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.stock === 0 ? (
                        <span className="badge badge-payment-failed">Out of Stock</span>
                      ) : (
                        <span className="badge badge-order-pending">{product.stock} Remaining</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <FiEdit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Status Overview Section */}
      <div className="admin-status-overview-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-recent-orders-title" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPieChart style={{ color: 'var(--color-primary)' }} /> Order Status Overview
          </h2>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => navigate('/admin/orders')}
            aria-label="Manage all customer orders"
          >
            Manage Orders
          </button>
        </div>

        <div className="admin-status-overview-grid">
          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/orders?status=Pending')}
            role="button"
            tabIndex={0}
            aria-label="Filter pending orders"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Pending')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--amber">
              <FiClock size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Pending</span>
              <span className="admin-stats-value">
                <CountUpValue value={orderStatusSummary.pending} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/orders?status=Processing')}
            role="button"
            tabIndex={0}
            aria-label="Filter processing orders"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Processing')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--blue">
              <FiRefreshCw size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Processing</span>
              <span className="admin-stats-value">
                <CountUpValue value={orderStatusSummary.processing} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/orders?status=Shipped')}
            role="button"
            tabIndex={0}
            aria-label="Filter shipped orders"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Shipped')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--indigo">
              <FiTruck size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Shipped</span>
              <span className="admin-stats-value">
                <CountUpValue value={orderStatusSummary.shipped} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/orders?status=Delivered')}
            role="button"
            tabIndex={0}
            aria-label="Filter delivered orders"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Delivered')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--green">
              <FiCheckCircle size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Delivered</span>
              <span className="admin-stats-value">
                <CountUpValue value={orderStatusSummary.delivered} />
              </span>
            </div>
          </div>

          <div
            className="admin-stats-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/orders?status=Cancelled')}
            role="button"
            tabIndex={0}
            aria-label="Filter cancelled orders"
            onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders?status=Cancelled')}
          >
            <div className="admin-stats-icon-box admin-stats-icon-box--red">
              <FiXCircle size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Cancelled</span>
              <span className="admin-stats-value">
                <CountUpValue value={orderStatusSummary.cancelled} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Analytics Section with Date Range Selector */}
      <div
        ref={salesAnalyticsRef}
        className="admin-sales-analytics-section"
        style={{ marginTop: 'var(--spacing-xxl)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <h2 className="admin-quick-actions-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FiBarChart2 style={{ color: 'var(--color-primary)' }} /> Sales Analytics
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="date-range-select" style={{ fontSize: 'var(--font-size-small)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
              Date Range:
            </label>
            <select
              id="date-range-select"
              className="admin-orders-select"
              style={{ minWidth: '160px', padding: '8px 14px' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          <div className="admin-stats-card">
            <div className="admin-stats-icon-box admin-stats-icon-box--blue">
              <FiCalendar size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Today's Sales</span>
              <span className="admin-stats-value">
                <CountUpValue value={salesAnalytics.todaySales} formatter={formatCurrency} />
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Based on today's completed orders
              </span>
            </div>
          </div>

          <div className="admin-stats-card">
            <div className="admin-stats-icon-box admin-stats-icon-box--amber">
              <FiCalendar size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">
                {dateRange === '7days' ? 'Weekly Sales' : dateRange === '30days' ? '30-Day Sales' : dateRange === '90days' ? '90-Day Sales' : dateRange === 'thisMonth' ? 'Monthly Sales' : 'Yearly Sales'}
              </span>
              <span className="admin-stats-value">
                <CountUpValue value={salesAnalytics.rangeRevenue} formatter={formatCurrency} />
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Selected period revenue
              </span>
            </div>
          </div>

          <div className="admin-stats-card">
            <div className="admin-stats-icon-box admin-stats-icon-box--green">
              <FiBarChart2 size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Monthly Sales</span>
              <span className="admin-stats-value">
                <CountUpValue value={monthlyRevenue} formatter={formatCurrency} />
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Current month
              </span>
            </div>
          </div>

          <div className="admin-stats-card">
            <div className="admin-stats-icon-box admin-stats-icon-box--purple">
              <FiTrendingUp size={24} />
            </div>
            <div className="admin-stats-info">
              <span className="admin-stats-label">Average Order Value</span>
              <span className="admin-stats-value">
                <CountUpValue value={salesAnalytics.aov} formatter={formatCurrency} />
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Revenue ÷ Orders ({salesAnalytics.rangeOrderCount} orders)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Section */}
      <div className="admin-revenue-trend-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-quick-actions-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FiTrendingUp style={{ color: 'var(--color-primary)' }} /> Revenue Trend
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
            {dateRange === '7days' ? 'Last 7 Days Revenue' : dateRange === '30days' ? 'Last 30 Days Revenue' : dateRange === '90days' ? 'Last 90 Days Revenue' : dateRange === 'thisMonth' ? 'This Month Revenue' : 'This Year Revenue'}
          </p>
        </div>

        <div className="admin-card-container">
          {revenueTrendData.length === 0 || revenueTrendData.every((item) => item.revenue === 0) ? (
            <div className="admin-empty-state-box">
              <FiBarChart2 size={44} className="admin-empty-state-icon" />
              <h3 className="admin-empty-state-title">No Revenue Data Available</h3>
              <p className="admin-empty-state-desc">Sales performance will appear here as orders are received.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e5e7eb)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
                    tick={{ fill: 'var(--color-text-secondary, #6b7280)', fontSize: 13 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                    tick={{ fill: 'var(--color-text-secondary, #6b7280)', fontSize: 13 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            style={{
                              backgroundColor: 'var(--color-surface, #ffffff)',
                              border: '1px solid var(--color-border, #e5e7eb)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              borderRadius: 'var(--radius-lg, 8px)',
                              boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary, #111827)', fontSize: '13px' }}>
                              {data.fullDay}
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: 'var(--color-primary, #4f46e5)', fontWeight: 'bold', fontSize: '14px' }}>
                              {formatCurrency(data.revenue)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-primary, #4f46e5)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Analytics Section */}
      <div className="admin-status-analytics-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-quick-actions-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FiPieChart style={{ color: 'var(--color-primary)' }} /> Order Status Analytics
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
            Current distribution of orders within selected range
          </p>
        </div>

        <div className="admin-card-container">
          {orderStatusChartData.length === 0 ? (
            <div className="admin-empty-state-box">
              <FiPieChart size={44} className="admin-empty-state-icon" />
              <h3 className="admin-empty-state-title">No Order Status Data</h3>
              <p className="admin-empty-state-desc">Distribution breakdown will appear once customer orders exist in this date range.</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {orderStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div
                            style={{
                              backgroundColor: 'var(--color-surface, #ffffff)',
                              border: '1px solid var(--color-border, #e5e7eb)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              borderRadius: 'var(--radius-lg, 8px)',
                              boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary, #111827)', fontSize: '13px' }}>
                              {data.name}
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: data.payload.color, fontWeight: 'bold', fontSize: '14px' }}>
                              {data.value} {data.value === 1 ? 'Order' : 'Orders'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span style={{ color: 'var(--color-text-primary, #111827)', fontSize: '13px', fontWeight: '500' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Timeline Section */}
      <div className="admin-activity-timeline-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-quick-actions-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FiActivity style={{ color: 'var(--color-primary)' }} /> Recent Activity
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
            Real-time store activity and status updates
          </p>
        </div>

        <div className="admin-card-container">
          {activityTimeline.length === 0 ? (
            <div className="admin-empty-state-box">
              <FiActivity size={44} className="admin-empty-state-icon" />
              <h3 className="admin-empty-state-title">No Recent Activity</h3>
              <p className="admin-empty-state-desc">System logs and store events will appear here.</p>
            </div>
          ) : (
            <div className="admin-timeline-container">
              {activityTimeline.map((item) => (
                <div key={item.id} className="admin-timeline-item">
                  <div className={`admin-timeline-icon-badge ${item.colorClass}`}>
                    {item.icon}
                  </div>
                  <div className="admin-timeline-content">
                    <div className="admin-timeline-header-row">
                      <h4 className="admin-timeline-title">{item.title}</h4>
                      <span className="admin-timeline-time">{item.formattedTime}</span>
                    </div>
                    <p className="admin-timeline-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="admin-recent-orders-section" style={{ marginTop: 'var(--spacing-xxl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h2 className="admin-recent-orders-title" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', margin: 0, color: 'var(--color-text-primary)' }}>
            Recent Orders
          </h2>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => navigate('/admin/orders')}
            aria-label="View all orders in admin panel"
          >
            View All Orders
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Order Status</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div className="admin-empty-state-box" style={{ padding: 0 }}>
                      <FiInbox size={40} className="admin-empty-state-icon" />
                      <h3 className="admin-empty-state-title">No Orders Yet</h3>
                      <p className="admin-empty-state-desc">Customer orders will appear here once placed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const customerName =
                    order.user?.name || order.shippingAddress?.fullName || 'Guest';
                  const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id-txt">
                          {order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="customer-name">{customerName}</span>
                      </td>
                      <td>
                        <span className={`badge badge-order-${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td>{orderDate}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                          aria-label={`View details for order ${order._id.substring(order._id.length - 8).toUpperCase()}`}
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
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
