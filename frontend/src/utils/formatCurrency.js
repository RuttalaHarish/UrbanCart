/**
 * UrbanCart — Currency Formatter Utility
 *
 * Formats a numeric amount to Indian Rupee (INR) currency format (₹).
 * Uses 'en-IN' locale with 0 fraction digits.
 *
 * @param {number} amount - The numeric amount to format.
 * @returns {string} Formatted INR currency string (e.g. ₹79,900).
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numericAmount);
};

export default formatCurrency;
