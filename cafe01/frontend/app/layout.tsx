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
  title: "Poket Cafe | Premium Food Delivery & Dining",
  description: "Experience lightning-fast premium food delivery and dining with Poket Cafe.",
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
      <body className="min-h-full flex flex-col font-sans text-foreground relative bg-[#100B07]" suppressHydrationWarning>
        {/* Global 4K Background Image with low opacity and blur */}
        <div 
          className="fixed inset-0 z-[-1] pointer-events-none"
          style={{
            backgroundImage: "url('/poket_cafe_bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(12px)",
          }}
        />
        <HydrationFix />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
