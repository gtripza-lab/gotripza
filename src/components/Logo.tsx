import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
  showWordmark = true,
  compact = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  compact?: boolean;
}) {
  const sizes = {
    sm: { box: "h-8 w-8", text: "text-base", sub: "text-[9px]", icon: 18 },
    md: { box: "h-9 w-9", text: "text-2xl", sub: "text-[10px]", icon: 20 },
    lg: { box: "h-12 w-12", text: "text-3xl", sub: "text-xs", icon: 27 },
    xl: { box: "h-20 w-20", text: "text-5xl", sub: "text-sm", icon: 44 },
  } as const;
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl bg-ink-950/80 shadow-glow ring-1 ring-white/10",
          s.box,
        )}
      >
        <LogoMark size={s.icon} />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-black tracking-tight text-white", s.text)}>
            Rya
          </span>
          {!compact && (
            <span className={cn("mt-0.5 font-semibold uppercase tracking-[0.16em] text-white/50", s.sub)}>
              by <span className="text-white/75">Go</span><span className="text-brand-mint">Tripza</span>
            </span>
          )}
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
      aria-label="Rya"
    >
      <defs>
        <linearGradient id="rya-grad" x1="8" y1="6" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="48%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#00D4B3" />
        </linearGradient>
      </defs>
      <path
        d="M19.4 43.1 C26.3 30.5 33.4 23.7 46.4 20.5 C37.9 30.5 32.2 39.8 28.4 50.8"
        stroke="url(#rya-grad)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M23.8 21.8 C36.9 20.6 46.3 26.2 51.8 38.1"
        stroke="url(#rya-grad)"
        strokeWidth="4.8"
        strokeLinecap="round"
        opacity="0.82"
      />
      <circle cx="48.4" cy="20.5" r="2.7" fill="#00D4B3" />
      <path d="M47.7 9.8 L50.1 15 L55.8 16.9 L50.1 18.9 L47.7 24.1 L45.2 18.9 L39.6 16.9 L45.2 15 Z" fill="white" />
    </svg>
  );
}
