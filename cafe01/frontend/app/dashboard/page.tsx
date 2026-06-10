import Navbar from "../components/Navbar";
import DashboardSection from "../components/DashboardSection";
import Footer from "../components/Footer";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col flex-1 w-full mx-auto justify-center bg-[#FCFBF8]">
        {/* ── Page Header ── */}
        <div
          className="relative w-full h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-black pt-[80px] border-b border-white/5"
        >
          <div className="absolute inset-0">
            <Image
              src="/poket_cafe_hero_4k.png"
              alt="Poket Cafe"
              fill
              unoptimized
              className="object-cover object-top brightness-[0.5] contrast-125 saturate-110"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#FCFBF8]/30 pointer-events-none" />
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
            <h2 
              className="text-white font-black text-3xl sm:text-4xl md:text-5xl tracking-widest uppercase filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Poket Cafe
            </h2>
            <div className="h-[2px] w-20 bg-cafe-secondary my-3 rounded-full" />
            <h1 className="text-cafe-secondary font-black text-xl sm:text-2xl uppercase tracking-wider">
              User Dashboard
            </h1>
          </div>
        </div>
        <DashboardSection />
      </main>
      <Footer />
    </>
  );
}
