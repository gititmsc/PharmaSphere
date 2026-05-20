const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Formats a "yyyy-MM-dd" string as "19-Feb-2026".
 * Pure string parsing — no Date object, so no timezone shifts.
 */
export function fmtDate(s: string | null | undefined): string {
  if (!s) return '—';
  const p = s.slice(0, 10).split('-');
  if (p.length < 3) return s;
  const day = parseInt(p[2], 10);
  const mon = parseInt(p[1], 10) - 1;
  const yr  = parseInt(p[0], 10);
  if (isNaN(day) || isNaN(mon) || isNaN(yr) || mon < 0 || mon > 11) return s;
  return `${String(day).padStart(2, '0')}-${MONTHS[mon]}-${yr}`;
}

/**
 * Formats a "yyyy-MM-dd HH:mm" string as "19-Feb-2026 10:15 PM".
 * Pure string parsing — no Date object, so no timezone shifts.
 */
export function fmtDateTime(s: string | null | undefined): string {
  if (!s) return '—';
  const [datePart, timePart] = s.split(' ');
  const base = fmtDate(datePart);
  if (!timePart) return base;
  const [hrStr, minStr = '00'] = timePart.split(':');
  let hr = parseInt(hrStr, 10);
  if (isNaN(hr)) return base;
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12 || 12;
  return `${base} ${String(hr).padStart(2, '0')}:${minStr} ${ampm}`;
}
