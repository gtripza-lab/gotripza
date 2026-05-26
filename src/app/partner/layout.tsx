import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const arabic = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rya Partners Dashboard",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060A13",
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} ${arabic.variable} bg-[#060A13] font-sans antialiased text-white`}>
        {children}
      </body>
    </html>
  );
}
