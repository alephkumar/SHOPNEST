export const formatPrice = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const truncate = (str, length = 60) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length).trim() + '…' : str;
};

export const statusColors = {
  pending: 'bg-slate/10 text-slate',
  confirmed: 'bg-amber/10 text-amber-dark',
  packed: 'bg-amber/10 text-amber-dark',
  shipped: 'bg-sage/10 text-sage-dark',
  delivered: 'bg-sage/20 text-sage-dark',
  cancelled: 'bg-red-100 text-red-700',
};
