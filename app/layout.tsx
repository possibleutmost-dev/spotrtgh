import type { Metadata, Viewport } from "next";
import { Barlow, Bebas_Neue } from "next/font/google";
import "./globals.css";

// The reference build ships Barlow at five weights for the interface and
// Bebas Neue as the display face; matching them keeps the type colour of the
// board identical.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stakeza Ghana | Online Sports Betting, Mobile Money Deposits",
  description:
    "Bet on football with mobile money. Fast deposits, fast payouts, booking codes and daily boosted odds.",
  manifest: "/manifest.json",
  icons: { icon: "/logo-mark.svg", apple: "/logo-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${bebas.variable}`}>
      <body>{children}</body>
    </html>
  );
}
