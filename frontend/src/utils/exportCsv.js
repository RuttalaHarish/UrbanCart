/**
 * Utility to convert an array of order objects into a downloadable CSV file.
 *
 * @param {Array<Object>} orders - Array of order objects to export
 * @param {string} [filename] - Custom filename (defaults to orders-YYYY-MM-DD.csv)
 * @returns {boolean} Success status
 */
export const exportOrdersToCsv = (orders, filename) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return false;
  }

  // 1. Define Headers
  const headers = [
    'Order ID',
    'Customer Name',
    'Customer Email',
    'Items',
    'Total Amount',
    'Order Status',
    'Payment Status',
    'Payment Method',
    'Created Date',
  ];

  // Helper to escape special CSV characters (commas, double-quotes, newlines)
  const escapeCsvValue = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  // 2. Format Data Rows
  const rows = orders.map((order) => {
    const orderId = order._id ? order._id.substring(order._id.length - 8).toUpperCase() : '';
    const customerName = order.user?.name || order.shippingAddress?.fullName || 'Guest Customer';
    const customerEmail = order.user?.email || 'N/A';
    const itemsCount = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)
      : 0;
    const totalAmount = order.totalAmount || 0;
    const orderStatus = order.orderStatus || 'Pending';
    const paymentStatus = order.paymentStatus || 'Pending';
    const paymentMethod = order.paymentMethod || 'COD';
    const createdDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

    return [
      escapeCsvValue(orderId),
      escapeCsvValue(customerName),
      escapeCsvValue(customerEmail),
      escapeCsvValue(itemsCount),
      escapeCsvValue(totalAmount),
      escapeCsvValue(orderStatus),
      escapeCsvValue(paymentStatus),
      escapeCsvValue(paymentMethod),
      escapeCsvValue(createdDate),
    ].join(',');
  });

  // 3. Combine Headers and Rows
  const csvContent = [headers.map(escapeCsvValue).join(','), ...rows].join('\n');

  // 4. Create Blob and Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `orders-${new Date().toISOString().split('T')[0]}.csv`;
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || defaultFilename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
