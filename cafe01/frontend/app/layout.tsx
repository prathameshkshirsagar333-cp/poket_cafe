import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { HydrationFix } from "./components/HydrationFix";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cafe Express | Premium Food Delivery & Dining",
  description: "Experience lightning-fast premium food delivery and dining with Cafe Express.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground bg-[#FCFBF8]" suppressHydrationWarning>
        <HydrationFix />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
