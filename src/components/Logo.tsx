import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}) {
  const sizes = {
    sm: { box: "h-8 w-8", text: "text-base", icon: 16 },
    md: { box: "h-9 w-9", text: "text-xl", icon: 18 },
    lg: { box: "h-12 w-12", text: "text-2xl", icon: 24 },
    xl: { box: "h-20 w-20", text: "text-5xl", icon: 40 },
  } as const;
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl shadow-glow",
          s.box,
        )}
      >
        <LogoMark size={s.icon} />
      </span>
      {showWordmark && (
        <span className={cn("font-display font-bold tracking-tight", s.text)}>
          Go<span className="text-gradient">Tripza</span>
        </span>
      )}
    </div>
  );
}

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GoTripza"
    >
      <defs>
        <linearGradient id="gtz-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5A6CFF" />
          <stop offset="55%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#00D4B3" />
        </linearGradient>
        <linearGradient id="gtz-grad-2" x1="64" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D4B3" />
          <stop offset="100%" stopColor="#5A6CFF" />
        </linearGradient>
      </defs>
      <path
        d="M14 14 L52 14 Q56 14 54 18 L40 28 Q38 30 36 28 L34 26 L34 50 Q34 54 30 54 L26 54 Q22 54 22 50 L22 22 L14 22 Q10 22 10 18 Q10 14 14 14 Z"
        fill="url(#gtz-grad)"
      />
      <path
        d="M40 16 Q48 12 54 18 L40 28 Q38 30 36 28 Z"
        fill="url(#gtz-grad-2)"
        opacity="0.85"
      />
    </svg>
  );
}
