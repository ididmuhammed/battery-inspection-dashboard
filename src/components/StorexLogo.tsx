export interface StorexLogoProps {
  /** 'full' includes the wordmark and strapline; 'mark' is the badge alone. */
  variant?: 'full' | 'mark';
  size?: number;
}

/**
 * Stand-in for the StoreX identity, drawn so the project runs with no assets.
 * Swap in the official artwork by replacing this file's output with an <img>.
 */
export function StorexLogo({ variant = 'full', size = 48 }: StorexLogoProps) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke="#14954a"
        strokeWidth="4.5"
        strokeDasharray="86 40"
        strokeLinecap="round"
      />
      <rect x="14" y="14" width="20" height="20" rx="4" fill="#123c7a" />
      <path d="M25 17l-5 8h4l-1 6 5-8h-4z" fill="#ffd23f" />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <span className="logo logo--mark">
        {mark}
        <b className="logo__word">
          Store<i>X</i>
        </b>
      </span>
    );
  }

  return (
    <span className="logo">
      {mark}
      <span>
        <b className="logo__word logo__word--large">
          Store<i>X</i>
        </b>
        <small className="logo__strap">Powering the future</small>
      </span>
    </span>
  );
}
