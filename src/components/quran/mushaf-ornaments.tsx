type OrnamentProps = {
  className?: string;
  mirrored?: boolean;
};

type AyahRosetteProps = {
  number: number;
  className?: string;
};

export function MushafSideOrnament({ className, mirrored = false }: OrnamentProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 92"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke">
        <path d="M8 46H60C77 46 84 20 106 20c20 0 31 26 50 26s30-26 50-26c22 0 29 26 46 26h60" />
        <path d="M8 46H60C77 46 84 72 106 72c20 0 31-26 50-26s30 26 50 26c22 0 29-26 46-26h60" />
        <path d="M24 18c16 0 21 11 21 28S40 74 24 74M296 18c-16 0-21 11-21 28s5 28 21 28" opacity=".72" />
        <path d="M88 46c0-16 7-29 18-29 12 0 19 13 19 29s-7 29-19 29c-11 0-18-13-18-29ZM195 46c0-16 7-29 19-29 11 0 18 13 18 29s-7 29-18 29c-12 0-19-13-19-29Z" opacity=".8" />
        <path d="M131 46c0-12 11-22 25-22s25 10 25 22-11 22-25 22-25-10-25-22Z" />
        <path d="M156 27v38M136 46h40" opacity=".55" />
      </g>
      <g fill="currentColor" opacity=".18">
        <circle cx="106" cy="20" r="4.4" />
        <circle cx="106" cy="72" r="4.4" />
        <circle cx="206" cy="20" r="4.4" />
        <circle cx="206" cy="72" r="4.4" />
        <circle cx="156" cy="46" r="5.2" />
      </g>
    </svg>
  );
}

export function AyahRosette({ number, className }: AyahRosetteProps) {
  const label = number.toLocaleString("ar-SA");

  return (
    <span className={className} aria-label={`الآية ${label}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="1.35">
          <path d="M24 3.5c3.2 5.2 7.2 6.2 12.4 3.4-.4 6 2.1 9.2 7.8 10.2-4.2 4.2-4.2 8.1 0 12.3-5.7 1-8.2 4.2-7.8 10.2-5.2-2.8-9.2-1.8-12.4 3.4-3.2-5.2-7.2-6.2-12.4-3.4.4-6-2.1-9.2-7.8-10.2 4.2-4.2 4.2-8.1 0-12.3 5.7-1 8.2-4.2 7.8-10.2C16.8 9.7 20.8 8.7 24 3.5Z" />
          <circle cx="24" cy="23.5" r="13.1" opacity=".72" />
          <circle cx="24" cy="23.5" r="9.4" opacity=".42" />
        </g>
      </svg>
      <span aria-hidden="true">{label}</span>
    </span>
  );
}
