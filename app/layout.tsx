import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { FavoritesProvider } from "@/components/favorites/favorites-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/layout/cookie-consent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kraskaprof.ru"),
  title: {
    default: "КраскаПроф — лакокрасочные материалы",
    template: "%s — КраскаПроф",
  },
  description:
    "Интернет-магазин красок, эмалей, грунтовок и спецсоставов. Колеровка в любой цвет, оплата при получении, бонусная программа.",
  keywords: [
    "краска",
    "купить краску",
    "лакокрасочные материалы",
    "колеровка",
    "фасадная краска",
    "интерьерная краска",
    "эмаль",
    "грунтовка",
  ],
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "КраскаПроф",
    title: "КраскаПроф — лакокрасочные материалы",
    description:
      "Сертифицированные краски и ЛКМ. Колеровка, оплата при получении.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#1b2d5b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${montserrat.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <div className="flex min-h-dvh flex-col">
                <Suspense fallback={null}>
                  <SiteHeader />
                </Suspense>
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <CookieConsent />
              <Toaster position="top-center" richColors />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
