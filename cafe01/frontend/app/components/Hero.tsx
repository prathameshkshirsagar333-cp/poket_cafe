"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[65vh] min-h-[350px] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Container starts exactly below navbar to show the cafe sign clearly */}
      <div className="absolute inset-x-0 bottom-0 top-[80px]">
        <Image
          src="/poket_cafe_hero_4k.png"
          alt="Poket Cafe Exterior Night"
          fill
          unoptimized
          className="object-cover object-top brightness-90 contrast-125 saturate-110"
          priority
          sizes="100vw"
        />
      </div>
      {/* Dark gradient overlay to enhance the night-time aesthetic and make the neon pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/10 to-background/80 pointer-events-none" />
    </section>
  );
}
