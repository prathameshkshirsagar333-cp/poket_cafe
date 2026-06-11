"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh] min-h-[350px] flex items-center justify-center overflow-hidden bg-black pt-[80px]"
    >
      <div className="absolute inset-0">
        <Image
          src="/poket_cafe_hero_4k.png"
          alt="Poket Cafe Exterior Night"
          fill
          unoptimized
          className="object-cover object-top brightness-[0.55] contrast-125 saturate-110"
          priority
          sizes="100vw"
        />
      </div>
      {/* Dark gradient overlay to enhance the night-time aesthetic and make the neon pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-[#FCFBF8]/30 pointer-events-none" />
      
      {/* Centered tagline/description */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <p className="text-cafe-secondary text-sm sm:text-base md:text-lg font-bold tracking-widest uppercase mt-4 max-w-md drop-shadow-md">
          Premium Food Delivery & Dining
        </p>
      </div>
    </section>
  );
}
