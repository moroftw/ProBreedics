export type MaskResult = { value: string; error: string };

export function maskYYYYMMDD(input: string): MaskResult {
  const s = input.replace(/\D/g, '').slice(0, 8);       // doar cifre, max 8
  const y = s.slice(0, 4);
  let m = s.slice(4, 6);
  let d = s.slice(6, 8);

  let error = '';

  if (m.length === 2) {
    const n = Number(m);
    if (n < 1 || n > 12) error = 'Month 01-12';
    m = String(Math.min(Math.max(n || 1, 1), 12)).padStart(2, '0');
  }
  if (d.length === 2) {
    const n = Number(d);
    if (n < 1 || n > 31) error = 'Day 01-31';
    d = String(Math.min(Math.max(n || 1, 1), 31)).padStart(2, '0');
  }

  if (s.length <= 4) return { value: y, error };
  if (s.length <= 6) return { value: `${y}-${m}`, error };
  return { value: `${y}-${m}-${d}`, error };
}

export function isFullValid(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}
