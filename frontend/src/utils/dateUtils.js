export const getISTDate = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export const getISTMonth = () => {
  return getISTDate().slice(0, 7);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};