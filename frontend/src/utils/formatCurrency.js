export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatHours(hours) {
  if (hours === undefined || hours === null || isNaN(hours)) return '0.0 hrs';
  return `${Number(hours).toFixed(1)} hrs`;
}

