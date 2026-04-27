"use client";

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Base sky gradient — soft sunset */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FCE7F3 0%, #E0E7FF 35%, #F6F8FF 70%, #F8FAFC 100%)",
        }}
      />

      {/* Sun glow on the right */}
      <div
        className="absolute -top-20 end-[10%] h-[480px] w-[480px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(251, 207, 232, 0.85) 0%, rgba(196, 181, 253, 0.45) 40%, transparent 70%)",
        }}
      />

      {/* Mint glow lower-left */}
      <div
        className="absolute bottom-0 start-[5%] h-[380px] w-[380px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(165, 243, 252, 0.45) 0%, transparent 65%)",
        }}
      />

      {/* Brand glow center */}
      <div
        className="absolute top-1/3 start-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(90, 108, 255, 0.18) 0%, transparent 65%)",
        }}
      />

      {/* Mountain silhouettes */}
      <svg
        viewBox="0 0 1600 600"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[55%] w-full opacity-90"
      >
        <defs>
          <linearGradient id="mtnA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="mtnB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="mtnC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0ABFC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <path
          d="M0,360 L120,300 L260,380 L400,260 L540,340 L700,240 L860,320 L1020,220 L1180,300 L1340,260 L1500,320 L1600,280 L1600,600 L0,600 Z"
          fill="url(#mtnC)"
        />
        <path
          d="M0,420 L100,380 L220,440 L360,360 L500,420 L640,340 L780,420 L920,360 L1080,420 L1240,360 L1400,420 L1600,380 L1600,600 L0,600 Z"
          fill="url(#mtnB)"
        />
        <path
          d="M0,500 L160,460 L320,510 L480,460 L640,510 L800,470 L960,510 L1120,470 L1280,510 L1440,470 L1600,500 L1600,600 L0,600 Z"
          fill="url(#mtnA)"
        />
      </svg>

      {/* Santorini-style buildings on the right */}
      <svg
        viewBox="0 0 600 400"
        preserveAspectRatio="xMaxYMax slice"
        className="absolute end-0 bottom-0 h-[50%] w-[55%] opacity-80"
      >
        <defs>
          <linearGradient id="bldgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="domeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5A6CFF" />
            <stop offset="100%" stopColor="#085CFF" />
          </linearGradient>
        </defs>
        {/* cliff */}
        <path d="M250,400 L300,260 L380,250 L460,240 L540,250 L600,255 L600,400 Z" fill="url(#mtnA)" />

        {/* houses */}
        <g fill="url(#bldgGrad)">
          <rect x="320" y="270" width="50" height="60" rx="3" />
          <rect x="380" y="280" width="45" height="55" rx="3" />
          <rect x="430" y="265" width="55" height="70" rx="3" />
          <rect x="490" y="275" width="50" height="65" rx="3" />
          <rect x="545" y="285" width="55" height="60" rx="3" />
          <rect x="350" y="320" width="80" height="50" rx="3" />
          <rect x="440" y="335" width="70" height="45" rx="3" />
          <rect x="520" y="340" width="80" height="50" rx="3" />
        </g>

        {/* blue domes */}
        <g fill="url(#domeGrad)" opacity="0.85">
          <ellipse cx="395" cy="280" rx="14" ry="10" />
          <rect x="392" y="278" width="6" height="10" />
          <ellipse cx="465" cy="265" rx="16" ry="11" />
          <rect x="462" y="262" width="6" height="11" />
          <ellipse cx="555" cy="285" rx="14" ry="9" />
        </g>

        {/* windows */}
        <g fill="#5A6CFF" opacity="0.4">
          <rect x="330" y="290" width="6" height="10" />
          <rect x="345" y="290" width="6" height="10" />
          <rect x="395" y="300" width="6" height="10" />
          <rect x="500" y="295" width="6" height="10" />
          <rect x="565" y="305" width="6" height="10" />
        </g>
      </svg>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,16,32,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(11,16,32,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Bottom fade to dark — smooth transition into the rest of the page */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
