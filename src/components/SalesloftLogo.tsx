// Salesloft app mark — the green tile with a white serif "S" and a lime dot
// (matches the uploaded brand icon). Rendered inline so it can pick up the
// host page's serif face for the "S". `wordmark` shows the "salesloft" text
// beside it (default on); pass wordmark={false} for the icon on its own.
interface Props {
  className?: string;
  /** Tile size in px (default 34). */
  size?: number;
  /** Show the "salesloft" wordmark beside the tile. */
  wordmark?: boolean;
}

export default function SalesloftLogo({ className, size = 34, wordmark = true }: Props) {
  return (
    <div className={`sl-logo ${className ?? ''}`}>
      <span className="sl-logo-mark" aria-hidden>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect width="100" height="100" rx="20" fill="#175a3b" />
          <text
            x="46"
            y="55"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Fraunces', 'Iowan Old Style', Georgia, serif"
            fontWeight="600"
            fontSize="82"
            fill="#ffffff"
          >
            S
          </text>
          <circle cx="72" cy="74" r="10" fill="#a4c93a" />
        </svg>
      </span>
      {wordmark && <span className="sl-logo-word">salesloft</span>}
    </div>
  );
}
