export default function generateDate(date: Date) {
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);

  startOfWeek.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('ro-RO', { month: 'long' });
    const year = date.getFullYear();
    return { day, month, year };
  };

  const start = formatDate(startOfWeek);
  const end = formatDate(endOfWeek);

  return start.month === end.month
    ? `${start.day}-${end.day} ${start.month} ${start.year}`
    : `${start.day} ${start.month} - ${end.day} ${end.month} ${start.year}`;
}