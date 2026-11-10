/**
 * Format a number as currency (USD)
 * @param {number|string} amount
 * @returns {string} - e.g. "$29.99"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(num);
};

/**
 * Format a number with standard commas
 * @param {number|string} num
 * @returns {string} - e.g. "1,250"
 */
export const formatNumber = (num) => {
  const parsed = Number(num);
  if (isNaN(parsed)) return '0';
  return new Intl.NumberFormat('en-US').format(parsed);
};
