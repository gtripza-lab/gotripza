import { detectRegion } from "@/lib/geo";
import type { Dictionary } from "@/i18n/get-dictionary";

type Method = { name: string; subtitle?: string };

const GULF_METHODS: Method[] = [
  { name: "Tamara", subtitle: "Split in 4" },
  { name: "Tabby", subtitle: "Pay later" },
  { name: "Mada" },
  { name: "Apple Pay" },
  { name: "Visa" },
  { name: "Mastercard" },
];

const WORLD_METHODS: Method[] = [
  { name: "Apple Pay" },
  { name: "PayPal" },
  { name: "Visa" },
  { name: "Mastercard" },
  { name: "Amex" },
  { name: "Klarna", subtitle: "Pay later" },
];

export function PaymentMethods({
  dict,
  variant = "row",
}: {
  dict: Dictionary;
  variant?: "row" | "compact";
}) {
  const region = detectRegion();
  const methods = region === "gulf" ? GULF_METHODS : WORLD_METHODS;
  const label =
    dict.payments?.title ??
    (dict.footer.tagline?.includes("بحث")
      ? "طرق دفع موثوقة"
      : "Trusted payment methods");

  return (
    <div
      className={
        variant === "compact"
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-col items-center gap-3"
      }
    >
      {variant === "row" && (
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {methods.map((m) => (
          <span
            key={m.name}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-md"
          >
            <span>{m.name}</span>
            {m.subtitle && (
              <span className="text-[10px] text-white/40">· {m.subtitle}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
