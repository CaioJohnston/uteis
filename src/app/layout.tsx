import type { Metadata } from "next";
import { Cormorant, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "úteis — ferramentas pessoais",
    template: "%s | úteis",
  },
  description:
    "Coleção de mini ferramentas, scripts utilitários e experimentos de IA construídos para uso pessoal e compartilhados com amigos.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "úteis",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
