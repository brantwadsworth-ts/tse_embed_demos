export default function DoorDashLogo({
  className = "",
  light = false,
}: {
  className?: string;
  /** Use white wordmark text for dark backgrounds (e.g. the sidebar). */
  light?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="14" cy="14" r="14" fill="#FF3008" />
        <path
          d="M7 11.5C7 9.567 8.567 8 10.5 8H14C17.3137 8 20 10.6863 20 14C20 17.3137 17.3137 20 14 20H8.5C7.67157 20 7 19.3284 7 18.5V11.5Z"
          fill="white"
        />
      </svg>
      <span
        className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-dd-black"}`}
      >
        DoorDash
      </span>
    </div>
  );
}
