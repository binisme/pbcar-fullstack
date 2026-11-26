const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function getVNDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [year, month, day] = formatter.format(date).split('-');
  return {
    year,
    month,
    day,
    dateKey: `${year}-${month}-${day}`,     // YYYY-MM-DD
    monthKey: `${year}-${month}`,           // YYYY-MM
    displayDate: `${day}/${month}/${year}`, // DD/MM/YYYY
  };
}

export function timestampToVNDateStr(ts) {
  return getVNDateParts(ts ? new Date(ts) : new Date()).displayDate;
}

// DD/MM/YYYY -> YYYY-MM-DD
export function vnDateStrToDateKey(dateStr) {
  const parts = String(dateStr || '').split('/');
  if (parts.length !== 3) return getVNDateParts().dateKey;
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

// YYYY-MM-DD -> DD/MM/YYYY
export function dateKeyToVNDateStr(dateKey) {
  const parts = String(dateKey || '').split('-');
  if (parts.length !== 3) return getVNDateParts().displayDate;
  return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
}

// DD/MM/YYYY -> YYYY-MM
export function vnDateStrToMonthKey(dateStr) {
  const parts = String(dateStr || '').split('/');
  if (parts.length !== 3) return getVNDateParts().monthKey;
  return `${parts[2]}-${parts[1].padStart(2, '0')}`;
}

export function formatMonthKeyToVN(monthKey) {
  const [y, m] = String(monthKey || '').split('-');
  if (!y || !m) return monthKey;
  return `Tháng ${m}/${y}`;
}
