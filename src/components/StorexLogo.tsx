export interface StorexLogoProps {
  /** 'full' renders the logo larger (welcome screen); 'mark' is the compact header size. */
  variant?: 'full' | 'mark';
  size?: number;
}

/** StoreX identity mark. Reads the artwork from /public/storex-logo.png. */
export function StorexLogo({ variant = 'full', size = 48 }: StorexLogoProps) {
  const height = variant === 'mark' ? size : size * 1.8;

  return (
    <img
      src="/storex-logo.png"
      alt="StoreX"
      className={variant === 'mark' ? 'logo logo--mark' : 'logo'}
      style={{ height, width: 'auto', display: 'block' }}
    />
  );
}
