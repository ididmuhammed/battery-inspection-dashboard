/** Fixed decimals so live values don't change width and jitter the layout. */
export function fixed(value: number, dp = 2): string {
  return value.toFixed(dp);
}

/** Signed kW, keeping the minus sign that tells an operator it's charging. */
export function signedKw(value: number): string {
  return `${value < 0 ? '-' : ''}${Math.abs(value).toFixed(2)}`;
}

export function clockTime(iso: string, locale = 'en-GB'): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function longDate(iso: string, locale = 'en-GB'): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function secondsAgo(from: number | null): number | null {
  if (!from) return null;
  return Math.round((Date.now() - from) / 1000);
}
