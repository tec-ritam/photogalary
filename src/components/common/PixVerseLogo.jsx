export default function PixVerseLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: "middle" }}
    >
      <defs>
        <linearGradient id="pv-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7928CA" />
          <stop offset="50%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#0070F3" />
        </linearGradient>
        <linearGradient id="pv-glow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF0080" />
          <stop offset="100%" stopColor="#7928CA" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="26" fill="url(#pv-bg)" />
      <circle cx="50" cy="50" r="26" stroke="#ffffff" strokeWidth="5" strokeOpacity="0.3" fill="none" />
      <circle cx="50" cy="50" r="16" fill="url(#pv-glow)" />
      <circle cx="50" cy="50" r="8" fill="#ffffff" />
      <circle cx="68" cy="32" r="5" fill="#00DFD8" />
    </svg>
  );
}
